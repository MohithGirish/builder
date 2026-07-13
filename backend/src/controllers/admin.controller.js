/*
 * admin.controller.js — HTTP handlers for the admin console.
 *
 * Exposes getMetrics (platform counts + weekly signup series), listVerifications
 * (builders filtered by verification_status, oldest submission first), and
 * reviewVerification (approve/reject a pending builder submission). Approve/reject
 * flips is_verified + verification_status and best-effort pushes a
 * 'verification_update' socket event to the affected user. All routes are
 * admin-only (enforced at the router level).
 */
'use strict';

const { fn, col, literal } = require('sequelize');
const AppError    = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const { User, Project, sequelize } = require('../models');
const { countQuotes } = require('./quote.controller');

const VERIFICATION_STATUSES = ['unverified', 'pending', 'approved', 'rejected'];

/**
 * GET /admin/metrics — platform counts and a weekly signup series.
 */
async function getMetrics(req, res, next) {
  try {
    const [builders, investors, total_users, projects, pending_verifications] = await Promise.all([
      User.count({ where: { role: 'builder' } }),
      User.count({ where: { role: 'investor' } }),
      User.count(),
      Project.count(),
      User.count({ where: { verification_status: 'pending' } }),
    ]);

    const quotes = await countQuotes();

    // Last-12-weeks registrations, bucketed by ISO week (PostgreSQL date_trunc).
    const rows = await User.findAll({
      attributes: [
        [fn('date_trunc', 'week', col('created_at')), 'week'],
        [fn('count', col('id')), 'count'],
      ],
      where: literal("created_at >= NOW() - INTERVAL '12 weeks'"),
      group: [literal('1')],
      order: [literal('1 ASC')],
      raw: true,
    });

    const signups = rows.map((r) => ({
      week:  new Date(r.week).toISOString().slice(0, 10),
      count: parseInt(r.count, 10),
    }));

    return sendSuccess(res, 200, {
      counts: {
        builders,
        investors,
        total_users,
        projects,
        pending_verifications,
        quotes,
      },
      signups,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /admin/verifications?status=pending — builders in the given state,
 * oldest submission first, with their submitted verification payload.
 */
async function listVerifications(req, res, next) {
  try {
    const status = req.query.status || 'pending';
    if (!VERIFICATION_STATUSES.includes(status)) {
      return next(new AppError(
        `status must be one of ${VERIFICATION_STATUSES.join(', ')}.`,
        400,
        'VALIDATION_ERROR'
      ));
    }

    const users = await User.findAll({
      where: { verification_status: status },
      order: [['verification_submitted_at', 'ASC']],
    });

    const data = users.map((u) => ({
      ...u.toPublicJSON(),
      verification_data:         u.verification_data,
      verification_submitted_at: u.verification_submitted_at,
    }));

    return sendSuccess(res, 200, { users: data });
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /admin/verifications/:userId — approve or reject a pending builder.
 */
async function reviewVerification(req, res, next) {
  try {
    const { userId } = req.params;
    const { action, reason } = req.body;

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'builder') {
      return next(new AppError('Builder not found.', 404, 'USER_001'));
    }
    if (user.verification_status !== 'pending') {
      return next(new AppError('This builder is not pending review.', 400, 'VERIFICATION_NOT_PENDING'));
    }

    if (action === 'approve') {
      await user.update({
        is_verified:              true,
        verification_status:      'approved',
        verification_reviewed_at: new Date(),
        verification_reason:      null,
      });
    } else {
      await user.update({
        is_verified:              false,
        verification_status:      'rejected',
        verification_reason:      reason,
        verification_reviewed_at: new Date(),
      });
    }

    // Best-effort real-time notice to the builder — never fail the request.
    try {
      const io = req.app.get('io');
      io?.to(`user:${user.id}`).emit('verification_update', {
        status: user.verification_status,
        reason: user.verification_reason,
      });
    } catch (emitErr) {
      console.error('[VERIFICATION SOCKET ERROR]', emitErr.message);
    }

    return sendSuccess(res, 200, { user: user.toPublicJSON() }, `Verification ${user.verification_status}.`);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getMetrics, listVerifications, reviewVerification };
