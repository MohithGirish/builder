/*
 * errorHandler.js — Global Express error-handling middleware.
 *
 * Catches all errors forwarded via next(err) and maps them to structured JSON
 * responses using sendError(). Handles Sequelize unique constraint and
 * validation errors, JWT JsonWebTokenError and TokenExpiredError, operational
 * AppError instances (4xx), and unexpected programmer errors (500). Stack
 * traces are suppressed in production for the latter.
 */
'use strict';

const { sendError } = require('../utils/response');

/**
 * Global Express error handler. Must have 4 parameters so Express recognises
 * it as an error-handling middleware.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    return sendError(res, 409, 'CONFLICT', 'A resource with that value already exists.');
  }

  // Sequelize validation
  if (err.name === 'SequelizeValidationError') {
    const details = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return sendError(res, 422, 'VALIDATION_ERROR', 'Validation failed.', details);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'AUTH_004', 'Invalid token.');
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'AUTH_004', 'Token has expired.');
  }

  // Operational errors thrown by AppError
  if (err.isOperational) {
    return sendError(res, err.statusCode, err.code, err.message);
  }

  // Unknown / programmer error — don't leak stack traces in production
  console.error('[UNHANDLED ERROR]', err);
  return sendError(
    res,
    500,
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : err.message
  );
}

module.exports = errorHandler;
