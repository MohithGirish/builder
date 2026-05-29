/*
 * user.routes.js — Express routes for user profile management endpoints.
 *
 * All routes require JWT authentication. Defines: GET /me (own profile),
 * PUT /me (update own profile with Joi validation), GET / (admin-only paginated
 * user list), GET /:id (admin or self), and PUT /:id/status (admin-only
 * activation/deactivation with Joi validation). Mounted at /api/v1/users.
 */
'use strict';

const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { validateUpdateProfile, validateUpdateStatus } = require('../validators/user.validators');
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /users/me
 * @access  Protected (any role)
 */
router.get('/me', userController.getMe);

/**
 * @route   PUT /users/me
 * @access  Protected (any role)
 */
router.put('/me', validateUpdateProfile, userController.updateMe);

/**
 * @route   GET /users
 * @access  Protected (admin only)
 */
router.get('/', authorize('admin'), userController.listUsers);

/**
 * @route   GET /users/:id
 * @access  Protected (admin or own profile)
 */
router.get('/:id', userController.getUserById);

/**
 * @route   PUT /users/:id/status
 * @access  Protected (admin only)
 */
router.put('/:id/status', authorize('admin'), validateUpdateStatus, userController.updateUserStatus);

module.exports = router;
