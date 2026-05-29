/*
 * user.controller.js — HTTP request handlers for user profile management.
 *
 * Exposes five controller functions: getMe (fetch own profile), updateMe
 * (update own profile), getUserById (admin or self only), updateUserStatus
 * (admin-only account activation/deactivation), and listUsers (admin-only
 * paginated user list). All responses use toPublicJSON() to strip password
 * hashes before sending.
 */
'use strict';

const AppError    = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const { User }    = require('../models');

/**
 * GET /users/me
 */
async function getMe(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return next(new AppError('User not found.', 404, 'USER_001'));
    return sendSuccess(res, 200, { user: user.toPublicJSON() });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUT /users/me
 */
async function updateMe(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return next(new AppError('User not found.', 404, 'USER_001'));

    await user.update(req.body);
    return sendSuccess(res, 200, { user: user.toPublicJSON() }, 'Profile updated successfully.');
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /users/:id  (admin or self)
 */
async function getUserById(req, res, next) {
  try {
    const { id } = req.params;

    // Non-admin users can only fetch their own profile
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return next(new AppError('You do not have permission to view this profile.', 403, 'FORBIDDEN'));
    }

    const user = await User.findByPk(id);
    if (!user) return next(new AppError('User not found.', 404, 'USER_001'));

    return sendSuccess(res, 200, { user: user.toPublicJSON() });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUT /users/:id/status  (admin only)
 */
async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return next(new AppError('Admins cannot deactivate their own account.', 400, 'BAD_REQUEST'));
    }

    const user = await User.findByPk(id);
    if (!user) return next(new AppError('User not found.', 404, 'USER_001'));

    await user.update({ is_active: req.body.is_active });

    const action = req.body.is_active ? 'activated' : 'deactivated';
    return sendSuccess(res, 200, { user: user.toPublicJSON() }, `User account ${action} successfully.`);
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /users  (admin only) — paginated list
 */
async function listUsers(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const offset = (page - 1) * limit;

    const { rows: users, count } = await User.findAndCountAll({
      offset,
      limit,
      order: [['created_at', 'DESC']],
    });

    return sendSuccess(res, 200, {
      users:      users.map((u) => u.toPublicJSON()),
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getMe, updateMe, getUserById, updateUserStatus, listUsers };
