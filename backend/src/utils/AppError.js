/*
 * AppError.js — Custom operational error class for the Builder AI backend.
 *
 * Extends the native Error class with an HTTP statusCode, a machine-readable
 * error code string, and an isOperational flag. The flag allows the global
 * error handler to distinguish predictable client-facing errors (validation,
 * auth failures) from unexpected programmer errors requiring a generic 500
 * response.
 */
'use strict';

/**
 * Operational error with an HTTP status code and an application error code.
 * Distinguishes expected failures (invalid input, auth errors) from programmer
 * mistakes so the global error handler can respond correctly.
 */
class AppError extends Error {
  /**
   * @param {string}  message    - Human-readable message sent to the client.
   * @param {number}  statusCode - HTTP status code (4xx / 5xx).
   * @param {string}  [code]     - Machine-readable code (e.g. "AUTH_002").
   */
  constructor(message, statusCode, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode  = statusCode;
    this.code        = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
