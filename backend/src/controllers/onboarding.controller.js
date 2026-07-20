/*
 * onboarding.controller.js — HTTP handler for the AI onboarding chat.
 *
 * Exposes chat(): validates the role and sanitises the client-sent message
 * history, then streams the turn over Server-Sent Events — `delta` events carry
 * text as the model generates it, and a final `done` event carries the full
 * result (message + any complete_onboarding preferences). On any AI error or
 * missing API key it emits `done` with { available:false } so the frontend can
 * fall back to the scripted questionnaire instead of surfacing a failure.
 */
'use strict';

const AppError  = require('../utils/AppError');
const aiService = require('../services/onboarding.service');

async function chat(req, res, next) {
  const { role, userName, messages } = req.body || {};

  // Validate before switching to the event-stream response.
  if (role !== 'builder' && role !== 'investor') {
    return next(new AppError('A valid role (builder or investor) is required.', 400, 'VALIDATION_ERROR'));
  }

  const cleanMessages = Array.isArray(messages)
    ? messages
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map((m) => ({ role: m.role, content: m.content }))
        .slice(-40) // bound history
    : [];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  try {
    const result = await aiService.streamOnboardingTurn(
      {
        role,
        userName: (typeof userName === 'string' && userName.trim()) || 'there',
        messages: cleanMessages,
      },
      (text) => send('delta', { text }),
    );
    send('done', result);
  } catch (err) {
    // Never break onboarding on an AI failure — signal fallback to the scripted flow.
    send('done', { available: false, error: 'ai_error' });
  }
  res.end();
}

module.exports = { chat };
