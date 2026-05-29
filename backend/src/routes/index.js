/*
 * routes/index.js — Top-level API router for the Builder AI backend.
 *
 * Mounts all feature-specific sub-routers under the /api/v1 prefix:
 * auth at /auth, users at /users, dealrooms at /dealrooms, and projects at
 * /projects. Also provides a GET /health endpoint that returns service status.
 * This router is imported by app.js and attached at /api/v1.
 */
'use strict';

const { Router } = require('express');
const authRoutes     = require('./auth.routes');
const userRoutes     = require('./user.routes');
const dealroomRoutes = require('./dealroom.routes');
const projectRoutes  = require('./project.routes');

const router = Router();

router.use('/auth',      authRoutes);
router.use('/users',     userRoutes);
router.use('/dealrooms', dealroomRoutes);
router.use('/projects',  projectRoutes);

router.get('/health', (req, res) => {
  res.json({
    success:   true,
    service:   'builder-ai-backend',
    status:    'healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
