/*
 * app.js — Express application factory for the Builder AI backend.
 *
 * Configures and exports the Express app instance with security headers
 * (Helmet), CORS with origin allowlist, JSON and URL-encoded body parsing,
 * HTTP request logging (Morgan), a global rate limiter, a stricter auth-
 * endpoint rate limiter, all API routes mounted at /api/v1, a 404 handler
 * for unknown routes, and the global error-handling middleware.
 */
'use strict';

require('dotenv').config();

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const routes       = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ── HTTP logging ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Global rate limiter ───────────────────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max:      parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' } },
  })
);

// ── Stricter rate limit for auth endpoints ────────────────────────────────────
app.use(
  '/api/v1/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max:      parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,
    message:  { success: false, error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts. Try again in 15 minutes.' } },
  })
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found.` },
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
