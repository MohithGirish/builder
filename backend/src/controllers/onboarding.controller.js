/*
 * onboarding.controller.js — HTTP handler for the AI onboarding chat.
 *
 * Exposes chat(): validates the role and sanitises the client-sent message
 * history, then delegates to ai.service.runOnboardingTurn(). On any AI error or
 * missing API key it responds 200 with { available:false } so the frontend can
 * fall back to the scripted questionnaire instead of surfacing a failure.
 */
'use strict';

const AppError        = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const aiService       = require('../services/onboarding.service');

async function chat(req, res, next) {
  const { role, userName, messages } = req.body || {};

  if (role !== 'builder' && role !== 'investor') {
    return next(new AppError('A valid role (builder or investor) is required.', 400, 'VALIDATION_ERROR'));
  }

  const cleanMessages = Array.isArray(messages)
    ? messages
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map((m) => ({ role: m.role, content: m.content }))
        .slice(-40) // bound history
    : [];

  try {
    const result = await aiService.runOnboardingTurn({
      role,
      userName: (typeof userName === 'string' && userName.trim()) || 'there',
      messages: cleanMessages,
    });
    return sendSuccess(res, 200, result);
  } catch (err) {
    // Never break onboarding on an AI failure — signal fallback to the scripted flow.
    return sendSuccess(res, 200, { available: false, error: 'ai_error' });
  }
}

module.exports = { chat };
