/*
 * dealroom.routes.js — Express routes for dealroom and messaging endpoints.
 *
 * All routes require JWT authentication. Defines: GET / (list dealrooms),
 * POST / (investor-only create), GET /:id (get with message history),
 * POST /:id/messages (send message REST fallback), PATCH /:id/read (mark
 * read), and PATCH /:id/status (update deal stage). Role-based access control
 * is enforced per route via the authorize middleware.
 */
'use strict';

const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const {
  listDealrooms,
  getDealroom,
  createDealroom,
  sendMessage,
  markRead,
  updateStatus,
} = require('../controllers/dealroom.controller');

const router = Router();

// All dealroom routes require a valid JWT
router.use(authenticate);

// GET  /api/v1/dealrooms          — list all dealrooms for current user
router.get('/', authorize('builder', 'investor', 'admin'), listDealrooms);

// POST /api/v1/dealrooms          — investor initiates a new dealroom
router.post('/', authorize('investor'), createDealroom);

// GET  /api/v1/dealrooms/:id      — get dealroom + message history
router.get('/:id', authorize('builder', 'investor', 'admin'), getDealroom);

// POST /api/v1/dealrooms/:id/messages  — send a message (REST fallback)
router.post('/:id/messages', authorize('builder', 'investor'), sendMessage);

// PATCH /api/v1/dealrooms/:id/read    — mark messages as read
router.patch('/:id/read', authorize('builder', 'investor'), markRead);

// PATCH /api/v1/dealrooms/:id/status  — update dealroom status
router.patch('/:id/status', authorize('builder', 'investor'), updateStatus);

module.exports = router;
