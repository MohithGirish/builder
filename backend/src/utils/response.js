/*
 * response.js — Standardised HTTP response helpers for the Builder AI backend.
 *
 * Exports sendSuccess(res, statusCode, data, message) which wraps payloads in
 * a { success: true, message?, data } envelope, success(data, message) which
 * returns that same envelope object (for controllers that call res.json(...)
 * themselves), and sendError(res, statusCode, code, message, details?) which
 * wraps error information in a { success: false, error: { code, message,
 * details? } } envelope. Used uniformly by controllers and the error handler.
 */
'use strict';

/**
 * Builds a success envelope object (does not send it). Used by controllers
 * that manage the response status themselves via res.json / res.status.
 *
 * @param {object} data
 * @param {string} [message]
 * @returns {{ success: true, message?: string, data?: object }}
 */
function success(data, message) {
  const body = { success: true };
  if (message) body.message = message;
  if (data !== undefined) body.data = data;
  return body;
}

/**
 * Sends a consistent success envelope.
 *
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {object} data
 * @param {string} [message]
 */
function sendSuccess(res, statusCode, data, message) {
  const body = { success: true };
  if (message) body.message = message;
  if (data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
}

/**
 * Sends a consistent error envelope.
 *
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} code
 * @param {string} message
 * @param {object} [details]
 */
function sendError(res, statusCode, code, message, details) {
  const body = { success: false, error: { code, message } };
  if (details) body.error.details = details;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess, success, sendError };
