/*
 * server.js — HTTP server entry point for the Builder AI backend.
 *
 * Verifies the PostgreSQL connection, creates an HTTP server from the Express
 * app, attaches Socket.io for real-time dealroom communication, and starts
 * listening on the configured PORT. Exits the process with a non-zero code if
 * the database connection or server startup fails.
 */
'use strict';

require('dotenv').config();

const http               = require('http');
const app                = require('./app');
const { sequelize }      = require('./models');
const { initSocket }     = require('./socket/dealroom.socket');

const PORT           = parseInt(process.env.PORT, 10) || 5000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map((o) => o.trim());

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('[DB] PostgreSQL connection established.');

    const httpServer = http.createServer(app);

    // Attach Socket.io
    const io = initSocket(httpServer, allowedOrigins);
    app.set('io', io);

    httpServer.listen(PORT, () => {
      console.log(`[SERVER] Builder AI Backend running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
      console.log(`[SOCKET] Socket.io listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[SERVER] Failed to start:', err.message || err);
    console.error('[SERVER] Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    process.exit(1);
  }
}

startServer();
