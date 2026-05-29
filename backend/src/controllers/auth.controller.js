/*
 * auth.controller.js — HTTP request handlers for authentication endpoints.
 *
 * Exposes four controller functions: register (POST /auth/register),
 * login (POST /auth/login), refresh (POST /auth/refresh), and logout
 * (POST /auth/logout). Each handler delegates business logic to auth.service,
 * attaches client IP and user-agent metadata for token storage, and uses
 * sendSuccess/next(err) for consistent response formatting.
 */
'use strict';

const authService  = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');
const { User, RefreshToken } = require('../models');

/** @param {import('express').Request} req */
function getClientMeta(req) {
  return {
    userAgent: req.headers['user-agent'] || null,
    ipAddress: (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim(),
  };
}

/**
 * POST /auth/register
 */
async function register(req, res, next) {
  try {
    const result = await authService.register(req.body, { User, RefreshToken }, getClientMeta(req));
    return sendSuccess(res, 201, result, 'Registration successful. Welcome to Builder AI!');
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /auth/login
 */
async function login(req, res, next) {
  try {
    const result = await authService.login(req.body, { User, RefreshToken }, getClientMeta(req));
    return sendSuccess(res, 200, result, 'Login successful.');
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /auth/refresh
 */
async function refresh(req, res, next) {
  try {
    const { refresh_token } = req.body;
    const result = await authService.refresh(refresh_token, { User, RefreshToken }, getClientMeta(req));
    return sendSuccess(res, 200, result);
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /auth/logout  (protected)
 */
async function logout(req, res, next) {
  try {
    const rawToken  = req.body?.refresh_token;
    const allDevices = req.body?.all_devices === true;
    await authService.logout(req.user.id, rawToken, { RefreshToken }, allDevices);
    return sendSuccess(res, 200, null, 'Logged out successfully.');
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, refresh, logout };
