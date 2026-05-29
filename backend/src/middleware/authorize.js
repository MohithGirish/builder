/*
 * authorize.js — RBAC (Role-Based Access Control) middleware factory.
 *
 * Returns an Express middleware function that permits only requests where
 * req.user.role is included in the provided roles list. Returns a 401 if
 * req.user is missing and a 403 AppError with a descriptive message if the
 * user's role is not permitted. Must be used after the authenticate middleware.
 */
'use strict';

const AppError = require('../utils/AppError');

/**
 * RBAC middleware factory. Returns a middleware that only allows requests from
 * users whose role is in the provided list.
 *
 * Usage:
 *   router.get('/admin/data', authenticate, authorize('admin'), handler);
 *   router.get('/projects',   authenticate, authorize('builder', 'investor'), handler);
 *
 * @param {...string} roles - Allowed role names.
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'AUTH_004'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role: ${roles.join(' or ')}.`,
          403,
          'FORBIDDEN'
        )
      );
    }

    return next();
  };
}

module.exports = authorize;
