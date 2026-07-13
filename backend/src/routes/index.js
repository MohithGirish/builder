/*
 * routes/index.js — Top-level API router for the Builder AI backend.
 *
 * Mounts all feature-specific sub-routers under the /api/v1 prefix:
 * auth at /auth, users at /users, projects at /projects, and the admin console
 * at /admin. Also provides a GET /health endpoint that returns service status.
 * This router is imported by app.js and attached at /api/v1.
 *
 * The dealroom router is deliberately not mounted — the Dealroom UI is a
 * "Coming Soon" placeholder, so its endpoints would be unused prod surface.
 * Restore the import + router.use('/dealrooms', …) when the feature ships.
 */
'use strict';

const { Router } = require('express');
const authRoutes     = require('./auth.routes');
const userRoutes     = require('./user.routes');
const projectRoutes  = require('./project.routes');
const quoteRoutes    = require('./quote.routes');
const fxRoutes       = require('./fx.routes');
const onboardingRoutes = require('./onboarding.routes');
const brochureRoutes = require('./brochure.routes');
const adminRoutes    = require('./admin.routes');

const router = Router();

router.use('/auth',      authRoutes);
router.use('/users',     userRoutes);
router.use('/projects',  projectRoutes);
router.use('/quotes',    quoteRoutes);
router.use('/fx',        fxRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/brochure',  brochureRoutes);
router.use('/admin',     adminRoutes);

router.get('/health', (req, res) => {
  res.json({
    success:   true,
    service:   'builder-ai-backend',
    status:    'healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
