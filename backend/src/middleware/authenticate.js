/*
 * authenticate.js — JWT access-token verification middleware.
 *
 * Reads the Bearer token from the Authorization header, verifies it against
 * JWT_ACCESS_SECRET, and attaches { id, role } from the decoded payload to
 * req.user. Returns a 401 AppError if the header is missing or the token is
 * invalid/expired. JWT errors are forwarded to the global error handler which
 * translates them to appropriate HTTP responses.
 */
'use strict';

const jwt     = require('jsonwebtoken');
const AppError = require('../utils/AppError');

/**
 * Verifies the Bearer access token from the Authorization header and attaches
 * the decoded payload to `req.user`.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No access token provided.', 401, 'AUTH_004'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = {
      id:   decoded.sub,
      role: decoded.role,
    };
    return next();
  } catch (err) {
    return next(err); // passed to errorHandler which handles JWT errors
  }
}

module.exports = authenticate;
