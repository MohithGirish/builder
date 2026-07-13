'use strict';

// Neutralise SMTP so the quote flow logs instead of sending real email during
// tests. Must be set before dotenv.config()/app require (dotenv won't override
// keys that already exist on process.env).
process.env.NODE_ENV   = 'test';
process.env.EMAIL_USER = '';
process.env.EMAIL_PASS = '';

require('dotenv').config();

const request  = require('supertest');
const bcrypt   = require('bcryptjs');
const app      = require('../src/app');
const { sequelize, User, RefreshToken, Project, Quote } = require('../src/models');

// Shared mock Socket.io — asserts targeted emits without a live socket server.
const mockIo = { to: jest.fn().mockReturnThis(), emit: jest.fn() };

beforeAll(async () => {
  await sequelize.sync({ force: true });
  app.set('io', mockIo);
});

afterAll(async () => {
  await sequelize.close();
});

afterEach(async () => {
  await Quote.destroy({ where: {} });
  await Project.destroy({ where: {} });
  await RefreshToken.destroy({ where: {} });
  await User.destroy({ where: {} });
  mockIo.to.mockClear();
  mockIo.emit.mockClear();
});

// ── Helpers ────────────────────────────────────────────────────────────────

async function registerUser(overrides = {}) {
  const payload = {
    email:      overrides.email      || 'user@test.com',
    password:   overrides.password   || 'Test@1234!',
    first_name: overrides.first_name || 'Test',
    last_name:  overrides.last_name  || 'User',
    role:       overrides.role       || 'builder',
  };
  const res = await request(app).post('/api/v1/auth/register').send(payload);
  return {
    accessToken:  res.body.data.tokens.access_token,
    refreshToken: res.body.data.tokens.refresh_token,
    userId:       res.body.data.user.id,
    email:        payload.email,
  };
}

async function createAdmin() {
  const hash  = await bcrypt.hash('Admin@1234!', 10);
  const admin = await User.create({
    email:               'admin@test.com',
    password_hash:       hash,
    role:                'admin',
    first_name:          'Admin',
    last_name:           'User',
    is_verified:         true,
    verification_status: 'approved',
  });
  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email:    'admin@test.com',
    password: 'Admin@1234!',
  });
  return { userId: admin.id, accessToken: loginRes.body.data.tokens.access_token };
}

const VALID_VERIFICATION = {
  reraState:  'Maharashtra',
  reraNumber: 'P51700000000',
  pan:        'ABCDE1234F',
  gstin:      '27ABCDE1234F1Z5',
  entityType: 'private_ltd',
  entityId:   'U70100MH2015PTC123456',
};

// ── Admin route protection ───────────────────────────────────────────────────

describe('Admin route protection', () => {
  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/v1/admin/metrics');
    expect(res.status).toBe(401);
  });

  it('returns 403 with a builder token', async () => {
    const { accessToken } = await registerUser({ email: 'b@test.com', role: 'builder' });
    const res = await request(app)
      .get('/api/v1/admin/metrics')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(403);
  });

  it('returns 403 with an investor token', async () => {
    const { accessToken } = await registerUser({ email: 'i@test.com', role: 'investor' });
    const res = await request(app)
      .get('/api/v1/admin/metrics')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(403);
  });

  it('returns 200 with an admin token', async () => {
    const { accessToken } = await createAdmin();
    const res = await request(app)
      .get('/api/v1/admin/metrics')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.counts).toBeDefined();
    expect(Array.isArray(res.body.data.signups)).toBe(true);
  });
});

// ── Builder verification flow ────────────────────────────────────────────────

describe('Builder verification flow', () => {
  it('builder submits valid Tier-1 payload → 200 pending', async () => {
    const { accessToken } = await registerUser({ email: 'b@test.com', role: 'builder' });
    const res = await request(app)
      .post('/api/v1/users/me/verification')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(VALID_VERIFICATION);

    expect(res.status).toBe(200);
    expect(res.body.data.user.verification_status).toBe('pending');
    expect(res.body.data.user.is_verified).toBe(false);
  });

  it('rejects an invalid PAN with 422', async () => {
    const { accessToken } = await registerUser({ email: 'b@test.com', role: 'builder' });
    const res = await request(app)
      .post('/api/v1/users/me/verification')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...VALID_VERIFICATION, pan: 'INVALID' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('forbids an investor from submitting verification', async () => {
    const { accessToken } = await registerUser({ email: 'i@test.com', role: 'investor' });
    const res = await request(app)
      .post('/api/v1/users/me/verification')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(VALID_VERIFICATION);

    expect(res.status).toBe(403);
  });

  it('admin queue shows the pending builder, then approve flips is_verified', async () => {
    const builder = await registerUser({ email: 'b@test.com', role: 'builder' });
    await request(app)
      .post('/api/v1/users/me/verification')
      .set('Authorization', `Bearer ${builder.accessToken}`)
      .send(VALID_VERIFICATION);

    const admin = await createAdmin();

    const queue = await request(app)
      .get('/api/v1/admin/verifications?status=pending')
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(queue.status).toBe(200);
    expect(queue.body.data.users.some((u) => u.id === builder.userId)).toBe(true);
    // verification_data is included in the admin queue serialization
    const entry = queue.body.data.users.find((u) => u.id === builder.userId);
    expect(entry.verification_data.pan).toBe('ABCDE1234F');

    const approve = await request(app)
      .patch(`/api/v1/admin/verifications/${builder.userId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ action: 'approve' });
    expect(approve.status).toBe(200);
    expect(approve.body.data.user.is_verified).toBe(true);
    expect(approve.body.data.user.verification_status).toBe('approved');

    // best-effort socket emit fired to the builder's per-user room
    expect(mockIo.to).toHaveBeenCalledWith(`user:${builder.userId}`);
    expect(mockIo.emit).toHaveBeenCalledWith('verification_update', expect.objectContaining({ status: 'approved' }));
  });

  it('approving a non-pending user returns 400', async () => {
    const builder = await registerUser({ email: 'b@test.com', role: 'builder' });
    const admin   = await createAdmin();
    // builder never submitted → status is 'unverified', not 'pending'
    const res = await request(app)
      .patch(`/api/v1/admin/verifications/${builder.userId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ action: 'approve' });
    expect(res.status).toBe(400);
  });

  it('reject requires a reason and sets rejected + reason; builder can re-submit', async () => {
    const builder = await registerUser({ email: 'b@test.com', role: 'builder' });
    await request(app)
      .post('/api/v1/users/me/verification')
      .set('Authorization', `Bearer ${builder.accessToken}`)
      .send(VALID_VERIFICATION);

    const admin = await createAdmin();

    // reject without a reason → 422
    const noReason = await request(app)
      .patch(`/api/v1/admin/verifications/${builder.userId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ action: 'reject' });
    expect(noReason.status).toBe(422);

    const reject = await request(app)
      .patch(`/api/v1/admin/verifications/${builder.userId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ action: 'reject', reason: 'Documents unclear.' });
    expect(reject.status).toBe(200);
    expect(reject.body.data.user.verification_status).toBe('rejected');
    expect(reject.body.data.user.verification_reason).toBe('Documents unclear.');

    // builder can re-submit after a rejection
    const resubmit = await request(app)
      .post('/api/v1/users/me/verification')
      .set('Authorization', `Bearer ${builder.accessToken}`)
      .send(VALID_VERIFICATION);
    expect(resubmit.status).toBe(200);
    expect(resubmit.body.data.user.verification_status).toBe('pending');
  });
});

// ── Verified-builder gating on project creation ──────────────────────────────

describe('Project creation gating', () => {
  it('unverified builder → 403 BUILDER_NOT_VERIFIED; verified builder → 201', async () => {
    const builder = await registerUser({ email: 'b@test.com', role: 'builder' });

    const blocked = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${builder.accessToken}`)
      .send({ name: 'Test Project' });
    expect(blocked.status).toBe(403);
    expect(blocked.body.error.code).toBe('BUILDER_NOT_VERIFIED');

    // submit + admin approve
    await request(app)
      .post('/api/v1/users/me/verification')
      .set('Authorization', `Bearer ${builder.accessToken}`)
      .send(VALID_VERIFICATION);
    const admin = await createAdmin();
    await request(app)
      .patch(`/api/v1/admin/verifications/${builder.userId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ action: 'approve' });

    const created = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${builder.accessToken}`)
      .send({ name: 'Test Project' });
    expect(created.status).toBe(201);
    expect(created.body.data.project.name).toBe('Test Project');
  });
});

// ── Quote-request socket notification ────────────────────────────────────────

describe('Quote-request socket notification', () => {
  it('emits quote_request to the owning builder, with projectName from the DB row', async () => {
    const builder = await registerUser({ email: 'builder-owner@test.com', role: 'builder' });
    // The notification target is resolved purely from the project's builder_id.
    const project = await Project.create({
      builder_id: builder.userId,
      name:       'Skyline Towers',
      status:     'active',
    });

    mockIo.to.mockClear();
    mockIo.emit.mockClear();

    const res = await request(app).post('/api/v1/quotes').send({
      projectId:    project.id,
      // Attacker-controlled display text must NOT reach the emit payload.
      projectName:  'You won! Click evil.com',
      projectEmail: 'builder-owner@test.com',
      userName:     'Jane Investor',
      userEmail:    'jane@test.com',
      userPhone:    '+919000000000',
    });
    expect(res.status).toBe(201);

    // fire-and-forget emit — allow the microtask/DB lookup to settle
    await new Promise((r) => setTimeout(r, 50));

    expect(mockIo.to).toHaveBeenCalledWith(`user:${builder.userId}`);
    // projectName comes from the trusted DB row, not the request body.
    expect(mockIo.emit).toHaveBeenCalledWith('quote_request', expect.objectContaining({
      projectName: 'Skyline Towers',
      userName:    'Jane Investor',
    }));
  });

  it('still notifies the owning builder when projectEmail differs from the builder account email', async () => {
    // Regression: the real flow posts projectEmail 'sales@e-infra.in' while the
    // builder account is 'builder@e-infra.in'. Ownership is builder_id, not email.
    const builder = await registerUser({ email: 'builder@e-infra.in', role: 'builder' });
    const project = await Project.create({
      builder_id: builder.userId,
      name:       'One Downtown',
      status:     'active',
    });

    mockIo.to.mockClear();
    mockIo.emit.mockClear();

    const res = await request(app).post('/api/v1/quotes').send({
      projectId:    project.id,
      projectName:  'One Downtown',
      projectEmail: 'sales@e-infra.in', // contact inbox — does not match the account email
      userName:     'Jane Investor',
      userEmail:    'jane@test.com',
      userPhone:    '+919000000000',
    });
    expect(res.status).toBe(201);

    await new Promise((r) => setTimeout(r, 50));

    expect(mockIo.to).toHaveBeenCalledWith(`user:${builder.userId}`);
    expect(mockIo.emit).toHaveBeenCalledWith('quote_request', expect.objectContaining({
      projectName: 'One Downtown',
      userName:    'Jane Investor',
    }));
  });
});

// ── Project listing visibility ───────────────────────────────────────────────

describe('Project listing visibility', () => {
  it('a builder cannot see another builder\'s draft projects via ?builder_id=', async () => {
    const owner  = await registerUser({ email: 'owner@test.com',  role: 'builder' });
    const snoop  = await registerUser({ email: 'snoop@test.com',  role: 'builder' });

    await Project.create({ builder_id: owner.userId, name: 'Secret Draft', status: 'draft' });
    await Project.create({ builder_id: owner.userId, name: 'Live One',     status: 'active' });

    const res = await request(app)
      .get(`/api/v1/projects?builder_id=${owner.userId}`)
      .set('Authorization', `Bearer ${snoop.accessToken}`);

    expect(res.status).toBe(200);
    const names = res.body.data.projects.map((p) => p.name);
    expect(names).toContain('Live One');       // public status still visible
    expect(names).not.toContain('Secret Draft'); // draft must be hidden
  });
});
