'use strict';

process.env.NODE_ENV = 'test';

require('dotenv').config();

const request = require('supertest');
const app     = require('../src/app');
const { sequelize, User, RefreshToken, Project } = require('../src/models');
const { bumpVersion } = require('../src/services/redis.service');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  // The public list is cached (Redis, or an in-process Map when Redis is absent).
  // Bump the namespace version so a previous test's cached payload can't be
  // served to the next one.
  await bumpVersion('projects:list');
});

afterEach(async () => {
  await Project.destroy({ where: {} });
  await RefreshToken.destroy({ where: {} });
  await User.destroy({ where: {} });
});

// ── Helpers ────────────────────────────────────────────────────────────────

async function registerBuilder(email) {
  const res = await request(app).post('/api/v1/auth/register').send({
    email, password: 'Test@1234!', first_name: 'Test', last_name: 'Builder', role: 'builder',
  });
  return { token: res.body.data.tokens.access_token, id: res.body.data.user.id };
}

const makeProject = (builder_id, overrides = {}) => Project.create({
  builder_id,
  name:           'Test Project',
  status:         'active',
  funding_target: 100,
  ...overrides,
});

const namesOf = (res) => res.body.data.projects.map((p) => p.name);

// ── GET /projects — visibility ─────────────────────────────────────────────

describe('GET /api/v1/projects (public, optional auth)', () => {
  test('anonymous callers get only active/completed projects', async () => {
    const builder = await registerBuilder('anon-vis@test.com');
    await makeProject(builder.id, { name: 'Live',      status: 'active' });
    await makeProject(builder.id, { name: 'Shipped',   status: 'completed' });
    await makeProject(builder.id, { name: 'Secret',    status: 'draft' });
    await makeProject(builder.id, { name: 'OnHold',    status: 'paused' });

    const res = await request(app).get('/api/v1/projects');

    expect(res.status).toBe(200);
    expect(namesOf(res).sort()).toEqual(['Live', 'Shipped']);
  });

  test('no 401 without a token, and an invalid token is treated as anonymous', async () => {
    const builder = await registerBuilder('badtoken@test.com');
    await makeProject(builder.id, { name: 'Secret', status: 'draft' });

    const res = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', 'Bearer not-a-real-jwt');

    expect(res.status).toBe(200);
    expect(namesOf(res)).toEqual([]);
  });

  test("a builder's drafts never appear for an anonymous caller scoping by builder_id", async () => {
    const builder = await registerBuilder('scoped@test.com');
    await makeProject(builder.id, { name: 'Secret', status: 'draft' });

    const res = await request(app).get(`/api/v1/projects?builder_id=${builder.id}`);

    expect(res.status).toBe(200);
    expect(namesOf(res)).toEqual([]);
  });

  test("a builder's drafts never appear for a PEER builder", async () => {
    const owner = await registerBuilder('owner@test.com');
    const peer  = await registerBuilder('peer@test.com');
    await makeProject(owner.id, { name: 'Secret', status: 'draft' });
    await makeProject(owner.id, { name: 'Live',   status: 'active' });

    const res = await request(app)
      .get(`/api/v1/projects?builder_id=${owner.id}`)
      .set('Authorization', `Bearer ${peer.token}`);

    expect(res.status).toBe(200);
    expect(namesOf(res)).toEqual(['Live']);
  });

  test('a builder sees all statuses of their own projects', async () => {
    const builder = await registerBuilder('own@test.com');
    await makeProject(builder.id, { name: 'Secret', status: 'draft' });
    await makeProject(builder.id, { name: 'Live',   status: 'active' });

    const res = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${builder.token}`);

    expect(res.status).toBe(200);
    expect(namesOf(res).sort()).toEqual(['Live', 'Secret']);
  });

  test("a builder's own listing is never written into the shared public cache", async () => {
    const builder = await registerBuilder('cache@test.com');
    await makeProject(builder.id, { name: 'Secret', status: 'draft' });

    // Builder's own-scope request runs first and must not populate the public key.
    const own = await request(app)
      .get(`/api/v1/projects?builder_id=${builder.id}`)
      .set('Authorization', `Bearer ${builder.token}`);
    expect(namesOf(own)).toEqual(['Secret']);

    const anon = await request(app).get(`/api/v1/projects?builder_id=${builder.id}`);
    expect(namesOf(anon)).toEqual([]);
  });
});

// ── GET /projects/:id — slug + uuid resolution ─────────────────────────────

describe('GET /api/v1/projects/:id', () => {
  test('resolves by slug and by uuid, and serializes content + slug', async () => {
    const builder = await registerBuilder('detail@test.com');
    const content = { tagline: 'Tag', coordinates: [17.4, 78.3], sections: { nearby: [] } };
    const p = await makeProject(builder.id, { name: 'One Downtown', slug: 'one-downtown', content });

    const bySlug = await request(app).get('/api/v1/projects/one-downtown');
    const byUuid = await request(app).get(`/api/v1/projects/${p.id}`);

    expect(bySlug.status).toBe(200);
    expect(byUuid.status).toBe(200);
    expect(bySlug.body.data.project.id).toBe(p.id);
    expect(byUuid.body.data.project.slug).toBe('one-downtown');
    expect(bySlug.body.data.project.content).toEqual(content);
  });

  test('404s an unknown slug', async () => {
    const res = await request(app).get('/api/v1/projects/no-such-project');
    expect(res.status).toBe(404);
  });

  test("a draft 404s for an anonymous caller but resolves for its owner", async () => {
    const builder = await registerBuilder('draftdetail@test.com');
    const p = await makeProject(builder.id, { name: 'Secret', slug: 'secret', status: 'draft' });

    const anon = await request(app).get('/api/v1/projects/secret');
    expect(anon.status).toBe(404);

    const owner = await request(app)
      .get(`/api/v1/projects/${p.id}`)
      .set('Authorization', `Bearer ${builder.token}`);
    expect(owner.status).toBe(200);
  });
});
