/*
 * token.service.js — JWT and refresh token utility service.
 *
 * Provides: generateAccessToken (signed JWT with sub/role claims),
 * generateRefreshTokenValue (64-byte random hex), hashToken (SHA-256),
 * persistRefreshToken (stores hash in DB, enforces a 5-token cap per user by
 * revoking oldest), validateRefreshToken (lookup + expiry/revocation checks),
 * revokeRefreshToken (single token), and revokeAllUserTokens (full logout).
 */
'use strict';

const jwt    = require('jsonwebtoken');
const crypto = require('crypto');

const MAX_ACTIVE_REFRESH_TOKENS = 5;

/**
 * Generates a signed access JWT.
 *
 * @param {{ id: string, role: string }} user
 * @returns {string} signed JWT
 */
function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
}

/**
 * Generates a cryptographically random opaque refresh token string.
 *
 * @returns {string} 64-byte hex string
 */
function generateRefreshTokenValue() {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * SHA-256 hash of the raw refresh token value.
 * We store the hash, not the raw value, in the database.
 *
 * @param {string} tokenValue
 * @returns {string}
 */
function hashToken(tokenValue) {
  return crypto.createHash('sha256').update(tokenValue).digest('hex');
}

/**
 * Persists a new refresh token in the database.
 * Enforces a cap of MAX_ACTIVE_REFRESH_TOKENS per user by removing the oldest
 * non-revoked tokens when the cap is exceeded.
 *
 * @param {import('../models').RefreshToken} RefreshToken
 * @param {string} userId
 * @param {string} rawToken
 * @param {object} meta  - { userAgent, ipAddress }
 * @returns {Promise<void>}
 */
async function persistRefreshToken(RefreshToken, userId, rawToken, meta = {}) {
  // Evict oldest tokens if cap is exceeded
  const existing = await RefreshToken.findAll({
    where:  { user_id: userId, is_revoked: false },
    order:  [['created_at', 'ASC']],
  });

  if (existing.length >= MAX_ACTIVE_REFRESH_TOKENS) {
    const toRevoke = existing.slice(0, existing.length - MAX_ACTIVE_REFRESH_TOKENS + 1);
    await RefreshToken.update(
      { is_revoked: true },
      { where: { id: toRevoke.map((t) => t.id) } }
    );
  }

  const expiresAt = new Date(
    Date.now() + (parseInt(process.env.JWT_REFRESH_EXPIRES_SECONDS, 10) || 604800) * 1000
  );

  await RefreshToken.create({
    user_id:    userId,
    token_hash: hashToken(rawToken),
    expires_at: expiresAt,
    user_agent: meta.userAgent || null,
    ip_address: meta.ipAddress || null,
  });
}

/**
 * Validates a raw refresh token against the database.
 * Returns the RefreshToken record on success, throws AppError otherwise.
 *
 * @param {import('../models').RefreshToken} RefreshToken
 * @param {string} rawToken
 * @returns {Promise<import('../models').RefreshToken>}
 */
async function validateRefreshToken(RefreshToken, rawToken) {
  const AppError = require('../utils/AppError');
  const hash = hashToken(rawToken);

  const record = await RefreshToken.findOne({ where: { token_hash: hash } });

  if (!record) {
    throw new AppError('Refresh token not found.', 401, 'AUTH_005');
  }
  if (record.is_revoked) {
    throw new AppError('Refresh token has been revoked.', 401, 'AUTH_005');
  }
  if (record.isExpired()) {
    await record.update({ is_revoked: true });
    throw new AppError('Refresh token has expired.', 401, 'AUTH_006');
  }

  return record;
}

/**
 * Revokes a specific refresh token.
 *
 * @param {import('../models').RefreshToken} RefreshToken
 * @param {string} rawToken
 */
async function revokeRefreshToken(RefreshToken, rawToken) {
  const hash   = hashToken(rawToken);
  const record = await RefreshToken.findOne({ where: { token_hash: hash } });
  if (record) await record.update({ is_revoked: true });
}

/**
 * Revokes all active refresh tokens for a user (full logout from all devices).
 *
 * @param {import('../models').RefreshToken} RefreshToken
 * @param {string} userId
 */
async function revokeAllUserTokens(RefreshToken, userId) {
  await RefreshToken.update(
    { is_revoked: true },
    { where: { user_id: userId, is_revoked: false } }
  );
}

module.exports = {
  generateAccessToken,
  generateRefreshTokenValue,
  hashToken,
  persistRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
