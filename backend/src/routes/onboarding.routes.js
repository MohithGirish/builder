/*
 * onboarding.routes.js — Express routes for the AI onboarding chat.
 *
 * Single authenticated endpoint POST /chat that drives the Claude-powered
 * conversational onboarding. Mounted at /api/v1/onboarding.
 */
'use strict';

const { Router } = require('express');
const onboardingController = require('../controllers/onboarding.controller');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.use(authenticate);

/**
 * @route   POST /onboarding/chat
 * @access  Protected (any role)
 */
router.post('/chat', onboardingController.chat);

module.exports = router;
