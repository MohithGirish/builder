/*
 * admin.routes.js — Express routes for the admin console.
 *
 * All routes are admin-only: the router applies authenticate + authorize('admin')
 * to every request. Defines GET /metrics (platform stats), GET /verifications
 * (builder verification queue by status), and PATCH /verifications/:userId
 * (approve/reject a pending builder). Mounted at /api/v1/admin.
 */
'use strict';

const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const adminController = require('../controllers/admin.controller');
const { validateReviewVerification } = require('../validators/admin.validators');

const router = Router();

// Every admin route requires an authenticated admin.
router.use(authenticate, authorize('admin'));

/**
 * @route   GET /admin/metrics
 * @access  Protected (admin only)
 */
router.get('/metrics', adminController.getMetrics);

/**
 * @route   GET /admin/verifications
 * @access  Protected (admin only)
 */
router.get('/verifications', adminController.listVerifications);

/**
 * @route   PATCH /admin/verifications/:userId
 * @access  Protected (admin only)
 */
router.patch('/verifications/:userId', validateReviewVerification, adminController.reviewVerification);

module.exports = router;
