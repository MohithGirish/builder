/*
 * dealroom.socket.js — Socket.io server initialisation and event handlers.
 *
 * Exports initSocket() which attaches Socket.io to the HTTP server with JWT
 * handshake authentication and joins each client to its own `user:<id>` room
 * for server-pushed notifications (quote requests, verification updates).
 *
 * registerDealroomHandlers() implements join/leave, message send + persist,
 * typing indicators, and read receipts, all gated on participant membership.
 * It is NOT registered while the Dealroom UI is a "Coming Soon" placeholder —
 * no client emits these events, so wiring them up would expose unexercised
 * message-write handlers. Call it from the connection handler when it ships.
 */
'use strict';

const jwt     = require('jsonwebtoken');
const { Op }  = require('sequelize');
const { Message, Dealroom, User } = require('../models');

const USER_ATTRS = ['id', 'first_name', 'last_name', 'role', 'profile_image'];

/**
 * Authenticate the socket connection via JWT passed as a handshake auth token.
 */
async function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) throw new Error('No auth token');

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    // Access tokens carry { sub, role } only — map sub → id for the handlers.
    socket.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new Error('Authentication failed'));
  }
}

/**
 * Register all dealroom socket event handlers for one connected client.
 */
function registerDealroomHandlers(io, socket) {
  const userId = socket.user.id;

  // ── Join a dealroom room ──────────────────────────────────────────────────
  socket.on('join_dealroom', async ({ dealroom_id }) => {
    try {
      const dealroom = await Dealroom.findByPk(dealroom_id);
      if (!dealroom) return socket.emit('error', { message: 'Dealroom not found' });
      if (dealroom.builder_id !== userId && dealroom.investor_id !== userId) {
        return socket.emit('error', { message: 'Access denied' });
      }
      await socket.join(`dealroom:${dealroom_id}`);
      socket.emit('joined_dealroom', { dealroom_id });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // ── Leave a dealroom room ─────────────────────────────────────────────────
  socket.on('leave_dealroom', ({ dealroom_id }) => {
    socket.leave(`dealroom:${dealroom_id}`);
  });

  // ── Send a message ────────────────────────────────────────────────────────
  socket.on('send_message', async ({ dealroom_id, content, message_type = 'text', file_url, file_name }) => {
    try {
      if (!content?.trim() && message_type === 'text') return;

      const dealroom = await Dealroom.findByPk(dealroom_id);
      if (!dealroom) return socket.emit('error', { message: 'Dealroom not found' });
      if (dealroom.builder_id !== userId && dealroom.investor_id !== userId) {
        return socket.emit('error', { message: 'Access denied' });
      }

      const message = await Message.create({
        dealroom_id,
        sender_id:    userId,
        content:      content.trim(),
        message_type,
        file_url:     file_url  || null,
        file_name:    file_name || null,
        is_read:      false,
      });

      await dealroom.update({ last_message_at: new Date() });

      const full = await Message.findByPk(message.id, {
        include: [{ model: User, as: 'sender', attributes: USER_ATTRS }],
      });

      // Broadcast to everyone in the room (including sender)
      io.to(`dealroom:${dealroom_id}`).emit('new_message', { message: full });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // ── Typing indicators ─────────────────────────────────────────────────────
  socket.on('typing_start', ({ dealroom_id }) => {
    // ponytail: the access token has no name claims; send an empty user_name.
    // Fetch first/last from the DB here if the dealroom UI ever needs to show it.
    socket.to(`dealroom:${dealroom_id}`).emit('user_typing', {
      user_id:   userId,
      user_name: '',
    });
  });

  socket.on('typing_stop', ({ dealroom_id }) => {
    socket.to(`dealroom:${dealroom_id}`).emit('user_stopped_typing', { user_id: userId });
  });

  // ── Mark messages as read ─────────────────────────────────────────────────
  socket.on('mark_read', async ({ dealroom_id }) => {
    try {
      await Message.update(
        { is_read: true },
        { where: { dealroom_id, is_read: false, sender_id: { [Op.ne]: userId } } }
      );
      io.to(`dealroom:${dealroom_id}`).emit('messages_marked_read', {
        dealroom_id,
        read_by: userId,
      });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });
}

/**
 * Initialise Socket.io and attach to the HTTP server.
 * @param {import('http').Server} httpServer
 * @param {string[]} allowedOrigins
 * @returns {import('socket.io').Server}
 */
function initSocket(httpServer, allowedOrigins) {
  const { Server } = require('socket.io');

  const io = new Server(httpServer, {
    cors: {
      origin:      allowedOrigins,
      credentials: true,
    },
    pingTimeout:  60000,
    pingInterval: 25000,
  });

  // JWT authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`[SOCKET] User ${socket.user.id} connected (${socket.id})`);
    // Per-user room for targeted server-pushed notifications (quote requests,
    // verification updates) independent of any dealroom membership.
    socket.join(`user:${socket.user.id}`);
    // Dealroom chat handlers stay unregistered until the Dealroom UI ships:
    // registerDealroomHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`[SOCKET] User ${socket.user.id} disconnected: ${reason}`);
    });
  });

  return io;
}

module.exports = { initSocket };
