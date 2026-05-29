'use strict';

require('dotenv').config();
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app     = require('../src/app');
const { sequelize, User, RefreshToken } = require('../src/models');
const bcrypt  = require('bcryptjs');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

afterEach(async () => {
  await RefreshToken.destroy({ where: {} });
  await User.destroy({ where: {} });
});

/** Helper: registers a user and returns { accessToken, refreshToken, userId } */
async function createAndLoginUser(overrides = {}) {
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
  };
}

/** Helper: creates an admin user directly in the DB */
async function createAdmin() {
  const hash = await bcrypt.hash('Admin@1234!', 10);
  const admin = await User.create({
    email:         'admin@test.com',
    password_hash: hash,
    role:          'admin',
    first_name:    'Admin',
    last_name:     'User',
    is_verified:   true,
  });

  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email:    'admin@test.com',
    password: 'Admin@1234!',
  });

  return {
    userId:      admin.id,
    accessToken: loginRes.body.data.tokens.access_token,
  };
}

// ── GET /users/me ─────────────────────────────────────────────────────────────

describe('GET /api/v1/users/me', () => {
  it('returns the authenticated user profile', async () => {
    const { accessToken } = await createAndLoginUser();

    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('user@test.com');
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
  });
});

// ── PUT /users/me ─────────────────────────────────────────────────────────────

describe('PUT /api/v1/users/me', () => {
  it('updates first and last name', async () => {
    const { accessToken } = await createAndLoginUser();

    const res = await request(app)
      .put('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ first_name: 'Updated', last_name: 'Name' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.first_name).toBe('Updated');
    expect(res.body.data.user.last_name).toBe('Name');
  });

  it('returns 422 with no fields', async () => {
    const { accessToken } = await createAndLoginUser();

    const res = await request(app)
      .put('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(422);
  });
});

// ── RBAC: admin-only routes ───────────────────────────────────────────────────

describe('RBAC enforcement', () => {
  it('GET /users returns 403 for a non-admin builder', async () => {
    const { accessToken } = await createAndLoginUser();

    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(403);
  });

  it('GET /users returns 200 for an admin', async () => {
    const { accessToken } = await createAdmin();

    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.users)).toBe(true);
  });

  it("GET /users/:id returns 403 when fetching another user's profile as a builder", async () => {
    const builder = await createAndLoginUser({ email: 'b1@test.com' });
    const other   = await createAndLoginUser({ email: 'b2@test.com' });

    const res = await request(app)
      .get(`/api/v1/users/${other.userId}`)
      .set('Authorization', `Bearer ${builder.accessToken}`);

    expect(res.status).toBe(403);
  });
});

// ── Admin: update user status ─────────────────────────────────────────────────

describe('PUT /api/v1/users/:id/status', () => {
  it('admin can deactivate a user', async () => {
    const { userId } = await createAndLoginUser();
    const { accessToken: adminToken } = await createAdmin();

    const res = await request(app)
      .put(`/api/v1/users/${userId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ is_active: false });

    expect(res.status).toBe(200);
    expect(res.body.data.user.is_active).toBe(false);
  });

  it('returns 403 for non-admin', async () => {
    const { userId, accessToken } = await createAndLoginUser();

    const res = await request(app)
      .put(`/api/v1/users/${userId}/status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ is_active: false });

    expect(res.status).toBe(403);
  });
});
