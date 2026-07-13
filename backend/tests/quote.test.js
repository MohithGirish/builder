'use strict';

// Neutralise SMTP so the quote flow logs instead of sending real email.
process.env.NODE_ENV   = 'test';
process.env.EMAIL_USER = '';
process.env.EMAIL_PASS = '';

require('dotenv').config();

const request = require('supertest');
const app     = require('../src/app');
const { sequelize, Quote } = require('../src/models');
const emailService = require('../src/services/email.service');

beforeAll(async () => {
  await sequelize.sync({ force: true });
  app.set('io', { to: jest.fn().mockReturnThis(), emit: jest.fn() });
});

afterAll(async () => {
  await sequelize.close();
});

afterEach(async () => {
  await Quote.destroy({ where: {} });
  jest.restoreAllMocks();
});

const body = (over = {}) => ({
  projectId:    '00000000-0000-0000-0000-000000000101',
  projectName:  'One Downtown',
  projectEmail: 'sales@e-infra.in',
  userName:     'Ada Lovelace',
  userEmail:    'ada@example.com',
  userPhone:    '+91 9000000000',
  whatsappConsent: false,
  layoutPreferences: ['3 BHK'],
  requirements: 'south facing',
  ...over,
});

const post = (over) => request(app).post('/api/v1/quotes').send(body(over));

// ── Durability ─────────────────────────────────────────────────────────────
// The flat file was safe against same-process interleaving (its read-modify-write
// was fully synchronous). It was NOT safe against an ephemeral filesystem, a
// second replica, or a truncated file — none of which a unit test can stage.
// What we can pin down is that the table keeps every insert and mints unique
// tokens, which is the property the new store has to hold.

describe('POST /api/v1/quotes — durability', () => {
  test('concurrent submissions all persist with distinct ids and tokens', async () => {
    const N = 8;
    const results = await Promise.all(
      Array.from({ length: N }, (_, i) => post({ userEmail: `racer${i}@example.com` }))
    );

    expect(results.every((r) => r.status === 201)).toBe(true);
    expect(await Quote.count()).toBe(N);

    // Every quote got a distinct id and a distinct response token.
    const rows = await Quote.findAll();
    expect(new Set(rows.map((r) => r.id)).size).toBe(N);
    expect(new Set(rows.map((r) => r.response_token)).size).toBe(N);
  });
});

// ── response_token is a credential and must never be serialized ────────────

describe('response_token confidentiality', () => {
  test('never appears in create, list, get, or get-by-token responses', async () => {
    const created = await post();
    const { id } = created.body.data;
    const token  = (await Quote.findByPk(id)).response_token;

    const list  = await request(app).get('/api/v1/quotes?email=ada@example.com');
    const one   = await request(app).get(`/api/v1/quotes/${id}`);
    const byTok = await request(app).get(`/api/v1/quotes/respond/${token}`);

    for (const res of [created, list, one, byTok]) {
      expect(res.status).toBeLessThan(400);
      expect(JSON.stringify(res.body)).not.toContain(token);
      expect(JSON.stringify(res.body)).not.toContain('responseToken');
      expect(JSON.stringify(res.body)).not.toContain('response_token');
    }
    // account/project email are internal routing, also stripped
    expect(JSON.stringify(one.body)).not.toContain('sales@e-infra.in');
  });
});

// ── Builder response ───────────────────────────────────────────────────────

describe('POST /api/v1/quotes/respond/:token', () => {
  // The conditional UPDATE (WHERE status='pending') is what makes this safe
  // across replicas, where the old read-check-write could genuinely interleave.
  test('two concurrent responses to the same link: exactly one wins', async () => {
    const { body: { data } } = await post();
    const token = (await Quote.findByPk(data.id)).response_token;

    const [a, b] = await Promise.all([
      request(app).post(`/api/v1/quotes/respond/${token}`).send({ builderResponse: 'first' }),
      request(app).post(`/api/v1/quotes/respond/${token}`).send({ builderResponse: 'second' }),
    ]);

    const codes = [a.status, b.status].sort();
    expect(codes).toEqual([200, 400]); // one accepted, one "already responded"

    const q = await Quote.findByPk(data.id);
    expect(q.status).toBe('responded');
    expect(['first', 'second']).toContain(q.builder_response);
  });

  test('404s an unknown token', async () => {
    const res = await request(app)
      .post('/api/v1/quotes/respond/11111111-2222-3333-4444-555555555555')
      .send({ builderResponse: 'hi' });
    expect(res.status).toBe(404);
  });
});

// ── Delete ─────────────────────────────────────────────────────────────────

describe('DELETE /api/v1/quotes/:id', () => {
  test('sends the cancellation email (regression: `email` was shadowed by a string)', async () => {
    const spy = jest.spyOn(emailService, 'sendQuoteDeletedToUser').mockResolvedValue();
    const { body: { data } } = await post();

    const res = await request(app).delete(`/api/v1/quotes/${data.id}?email=ada@example.com`);

    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].quote.userEmail).toBe('ada@example.com');
    expect(await Quote.count()).toBe(0);
  });

  test('a non-owner cannot delete, and the row survives', async () => {
    const { body: { data } } = await post();
    const res = await request(app).delete(`/api/v1/quotes/${data.id}?email=mallory@example.com`);
    expect(res.status).toBe(403);
    expect(await Quote.count()).toBe(1);
  });
});

// ── Listing ────────────────────────────────────────────────────────────────

describe('GET /api/v1/quotes', () => {
  test('matches userEmail OR accountEmail, case-insensitively', async () => {
    await post({ userEmail: 'reply-to@example.com', accountEmail: 'Signed.In@Example.com' });

    const byAccount = await request(app).get('/api/v1/quotes?email=signed.in@example.com');
    const byReply   = await request(app).get('/api/v1/quotes?email=REPLY-TO@example.com');

    expect(byAccount.body.data).toHaveLength(1);
    expect(byReply.body.data).toHaveLength(1);
  });

  test('projectEmail lists the builder side', async () => {
    await post();
    const res = await request(app).get('/api/v1/quotes?projectEmail=sales@e-infra.in');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].projectName).toBe('One Downtown');
  });

  test('requires one of email / projectEmail', async () => {
    const res = await request(app).get('/api/v1/quotes');
    expect(res.status).toBe(400);
  });
});

// ── PII purge on account deletion ──────────────────────────────────────────

describe('purgeQuotesByEmail', () => {
  test('removes quotes matched by either userEmail or accountEmail', async () => {
    const { purgeQuotesByEmail } = require('../src/controllers/quote.controller');
    await post({ userEmail: 'gone@example.com' });
    await post({ userEmail: 'other@example.com', accountEmail: 'Gone@example.com' });
    await post({ userEmail: 'keep@example.com' });

    const removed = await purgeQuotesByEmail('GONE@example.com');

    expect(removed).toBe(2);
    expect(await Quote.count()).toBe(1);
  });
});
