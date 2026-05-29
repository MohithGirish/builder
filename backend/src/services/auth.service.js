/*
 * auth.service.js — Business logic for user authentication workflows.
 *
 * Exports four functions: register (hashes password, creates user, issues
 * tokens), login (constant-time password comparison, issues tokens), refresh
 * (validates and rotates refresh token), and logout (revokes one or all
 * refresh tokens for the user). All token operations are delegated to
 * token.service. Throws operational AppErrors for expected failure cases.
 */
'use strict';

const bcrypt   = require('bcryptjs');
const AppError = require('../utils/AppError');
const tokenSvc = require('./token.service');

/**
 * Registers a new user and returns tokens.
 *
 * @param {{ email, password, first_name, last_name, role }} dto
 * @param {{ User, RefreshToken }} models
 * @param {{ userAgent, ipAddress }} meta
 */
async function register(dto, { User, RefreshToken }, meta = {}) {
  const existing = await User.findOne({ where: { email: dto.email } });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'AUTH_001');
  }

  const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
  const passwordHash  = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

  const user = await User.create({
    email:         dto.email,
    password_hash: passwordHash,
    role:          dto.role,
    first_name:    dto.first_name,
    last_name:     dto.last_name,
  });

  const rawRefreshToken = tokenSvc.generateRefreshTokenValue();
  await tokenSvc.persistRefreshToken(RefreshToken, user.id, rawRefreshToken, meta);

  return {
    user:   user.toPublicJSON(),
    tokens: buildTokenPayload(user, rawRefreshToken),
  };
}

/**
 * Authenticates a user with email/password and returns tokens.
 *
 * @param {{ email, password }} dto
 * @param {{ User, RefreshToken }} models
 * @param {{ userAgent, ipAddress }} meta
 */
async function login(dto, { User, RefreshToken }, meta = {}) {
  const user = await User.findOne({ where: { email: dto.email } });

  // Constant-time comparison to prevent timing attacks even when user is null
  const dummyHash = '$2a$12$invalidhashfordummycomparison111111111111111111111111111';
  const isMatch   = user
    ? await bcrypt.compare(dto.password, user.password_hash)
    : await bcrypt.compare(dto.password, dummyHash);

  if (!user || !isMatch) {
    throw new AppError('Invalid email or password.', 401, 'AUTH_002');
  }

  if (!user.is_active) {
    throw new AppError('This account has been deactivated. Please contact support.', 403, 'AUTH_003');
  }

  const rawRefreshToken = tokenSvc.generateRefreshTokenValue();
  await tokenSvc.persistRefreshToken(RefreshToken, user.id, rawRefreshToken, meta);

  return {
    user:   user.toPublicJSON(),
    tokens: buildTokenPayload(user, rawRefreshToken),
  };
}

/**
 * Rotates a refresh token: validates the old one, revokes it, issues new tokens.
 *
 * @param {string} rawRefreshToken
 * @param {{ User, RefreshToken }} models
 * @param {{ userAgent, ipAddress }} meta
 */
async function refresh(rawRefreshToken, { User, RefreshToken }, meta = {}) {
  const tokenRecord = await tokenSvc.validateRefreshToken(RefreshToken, rawRefreshToken);

  const user = await User.findByPk(tokenRecord.user_id);
  if (!user || !user.is_active) {
    throw new AppError('User not found or deactivated.', 401, 'AUTH_004');
  }

  // Rotate: revoke old, issue new
  await tokenRecord.update({ is_revoked: true });
  const newRawToken = tokenSvc.generateRefreshTokenValue();
  await tokenSvc.persistRefreshToken(RefreshToken, user.id, newRawToken, meta);

  return {
    tokens: buildTokenPayload(user, newRawToken),
  };
}

/**
 * Revokes a specific or all refresh tokens for a user.
 *
 * @param {string}  userId
 * @param {string}  [rawRefreshToken]  - If provided, revokes only this token.
 * @param {{ RefreshToken }} models
 * @param {boolean} [allDevices=false]
 */
async function logout(userId, rawRefreshToken, { RefreshToken }, allDevices = false) {
  if (allDevices || !rawRefreshToken) {
    await tokenSvc.revokeAllUserTokens(RefreshToken, userId);
  } else {
    await tokenSvc.revokeRefreshToken(RefreshToken, rawRefreshToken);
  }
}

/** @private */
function buildTokenPayload(user, rawRefreshToken) {
  return {
    access_token:  tokenSvc.generateAccessToken(user),
    refresh_token: rawRefreshToken,
    token_type:    'Bearer',
    expires_in:    900, // 15 minutes in seconds
  };
}

module.exports = { register, login, refresh, logout };
