'use strict';

require('dotenv').config();
process.env.NODE_ENV = 'test';

const request   = require('supertest');
const app       = require('../src/app');
const { sequelize, User, RefreshToken } = require('../src/models');

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

// ── Registration ─────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/register', () => {
  const validPayload = {
    email:      'builder@test.com',
    password:   'Test@1234!',
    first_name: 'Alice',
    last_name:  'Builder',
    role:       'builder',
  };

  it('registers a new user and returns 201 with tokens', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('builder@test.com');
    expect(res.body.data.user.role).toBe('builder');
    expect(res.body.data.user.password_hash).toBeUndefined();
    expect(res.body.data.tokens.access_token).toBeDefined();
    expect(res.body.data.tokens.refresh_token).toBeDefined();
  });

  it('returns 409 when email is already registered', async () => {
    await request(app).post('/api/v1/auth/register').send(validPayload);
    const res = await request(app).post('/api/v1/auth/register').send(validPayload);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('AUTH_001');
  });

  it('returns 422 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validPayload, email: 'not-an-email' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 for weak password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validPayload, password: 'weak' });

    expect(res.status).toBe(422);
  });

  it('returns 422 when role is "admin" (not allowed at registration)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validPayload, role: 'admin' });

    expect(res.status).toBe(422);
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send({
      email:      'builder@test.com',
      password:   'Test@1234!',
      first_name: 'Alice',
      last_name:  'Builder',
      role:       'builder',
    });
  });

  it('returns 200 with tokens on valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'builder@test.com', password: 'Test@1234!' });

    expect(res.status).toBe(200);
    expect(res.body.data.tokens.access_token).toBeDefined();
    expect(res.body.data.tokens.refresh_token).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'builder@test.com', password: 'WrongPass@1!' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_002');
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@test.com', password: 'Test@1234!' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_002');
  });
});

// ── Token Refresh ─────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/refresh', () => {
  let refreshToken;

  beforeEach(async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email:      'builder@test.com',
      password:   'Test@1234!',
      first_name: 'Alice',
      last_name:  'Builder',
      role:       'builder',
    });
    refreshToken = res.body.data.tokens.refresh_token;
  });

  it('returns new tokens for a valid refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refresh_token: refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.tokens.access_token).toBeDefined();
    expect(res.body.data.tokens.refresh_token).toBeDefined();
    // Token should be rotated (different value)
    expect(res.body.data.tokens.refresh_token).not.toBe(refreshToken);
  });

  it('returns 401 when the same refresh token is reused after rotation', async () => {
    await request(app).post('/api/v1/auth/refresh').send({ refresh_token: refreshToken });

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refresh_token: refreshToken });

    expect(res.status).toBe(401);
  });

  it('returns 401 for an invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refresh_token: 'totallyfaketoken' });

    expect(res.status).toBe(401);
  });
});

// ── Logout ────────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/logout', () => {
  let accessToken;
  let refreshToken;

  beforeEach(async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email:      'builder@test.com',
      password:   'Test@1234!',
      first_name: 'Alice',
      last_name:  'Builder',
      role:       'builder',
    });
    accessToken  = res.body.data.tokens.access_token;
    refreshToken = res.body.data.tokens.refresh_token;
  });

  it('logs out and revokes the token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refresh_token: refreshToken });

    expect(res.status).toBe(200);

    // Refresh token should now be invalid
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refresh_token: refreshToken });
    expect(refreshRes.status).toBe(401);
  });

  it('returns 401 without an Authorization header', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(401);
  });
});
