/*
 * auth.routes.js — Express routes for authentication endpoints.
 *
 * Defines four routes: POST /register (new account), POST /login (credentials),
 * POST /refresh (token rotation), and POST /logout (protected, revokes tokens).
 * Each route applies the appropriate Joi validation middleware before delegating
 * to auth.controller handlers. All routes are mounted under /api/v1/auth.
 */
'use strict';

const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin, validateRefresh } = require('../validators/auth.validators');
const authenticate = require('../middleware/authenticate');

const router = Router();

/**
 * @route   POST /auth/register
 * @access  Public
 * @desc    Register a new builder or investor account.
 */
router.post('/register', validateRegister, authController.register);

/**
 * @route   POST /auth/login
 * @access  Public
 * @desc    Authenticate with email/password. Returns access + refresh tokens.
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   POST /auth/refresh
 * @access  Public
 * @desc    Exchange a valid refresh token for a new token pair (rotation).
 */
router.post('/refresh', validateRefresh, authController.refresh);

/**
 * @route   POST /auth/logout
 * @access  Protected
 * @desc    Revoke one or all refresh tokens. Pass all_devices:true to sign out everywhere.
 */
router.post('/logout', authenticate, authController.logout);

module.exports = router;
