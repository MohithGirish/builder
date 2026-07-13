/*
 * user.controller.js — HTTP request handlers for user profile management.
 *
 * Exposes controller functions: getMe (fetch own profile), updateMe
 * (update own profile), deleteMe, submitVerification (builder-only submission
 * for admin review), getUserById (admin or self only), updateUserStatus
 * (admin-only account activation/deactivation), and listUsers (admin-only
 * paginated + filterable user list). All responses use toPublicJSON() to strip
 * password hashes before sending.
 */
'use strict';

const bcrypt      = require('bcryptjs');
const { Op }      = require('sequelize');
const AppError    = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const { User }    = require('../models');
const { purgeQuotesByEmail } = require('./quote.controller');

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
 * DELETE /users/me — permanently delete own account.
 * Requires the owner to re-authenticate (email + password) in the request body.
 * RefreshTokens cascade via User.hasMany(onDelete: 'CASCADE').
 */
async function deleteMe(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return next(new AppError('Email and password are required to delete your account.', 400, 'VALIDATION_ERROR'));
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return next(new AppError('User not found.', 404, 'USER_001'));

    // Re-authenticate the owner: the supplied email must match the logged-in
    // account and the password must verify against the stored hash.
    const emailMatches    = String(email).trim().toLowerCase() === user.email.toLowerCase();
    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!emailMatches || !passwordMatches) {
      return next(new AppError('Email or password is incorrect.', 401, 'AUTH_002'));
    }

    // Await: an unawaited purge could lose the race with the response and leave
    // the requester's PII behind after their account is gone.
    await purgeQuotesByEmail(user.email);
    await user.destroy();
    return sendSuccess(res, 200, null, 'Your account has been deleted.');
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /users/me/verification  (builder only)
 * Submits India statutory credentials for admin review. Rejects if the account
 * is already under review ('pending') or already approved.
 */
async function submitVerification(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return next(new AppError('User not found.', 404, 'USER_001'));

    if (user.verification_status === 'pending') {
      return next(new AppError('Your verification is already under review.', 400, 'VERIFICATION_PENDING'));
    }
    if (user.verification_status === 'approved') {
      return next(new AppError('Your account is already verified.', 400, 'VERIFICATION_APPROVED'));
    }

    await user.update({
      verification_data:         req.body,
      verification_status:       'pending',
      verification_submitted_at: new Date(),
      verification_reason:       null,
      // is_verified stays false until an admin approves.
    });

    return sendSuccess(res, 200, { user: user.toPublicJSON() }, 'Verification submitted for review.');
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

    const payload = user.toPublicJSON();
    // Admins need the submitted statutory credentials to review verification;
    // toPublicJSON() deliberately omits them so public-facing paths never leak.
    if (req.user.role === 'admin') {
      payload.verification_data = user.verification_data;
    }

    return sendSuccess(res, 200, { user: payload });
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

    const where = {};

    const { search, role, is_active } = req.query;
    if (search) {
      const like = { [Op.iLike]: `%${search}%` };
      where[Op.or] = [
        { first_name: like },
        { last_name:  like },
        { email:      like },
      ];
    }
    if (role && ['builder', 'investor', 'admin'].includes(role)) {
      where.role = role;
    }
    if (is_active === 'true')  where.is_active = true;
    if (is_active === 'false') where.is_active = false;

    const { rows: users, count } = await User.findAndCountAll({
      where,
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

module.exports = { getMe, updateMe, deleteMe, submitVerification, getUserById, updateUserStatus, listUsers };
