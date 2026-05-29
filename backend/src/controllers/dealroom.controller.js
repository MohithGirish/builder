/*
 * dealroom.controller.js — HTTP request handlers for dealroom and messaging.
 *
 * Exposes six controller functions: listDealrooms (with unread counts),
 * getDealroom (with paginated message history), createDealroom (investor-only),
 * sendMessage (REST fallback for socket), markRead (marks messages as read),
 * and updateStatus (escalates dealroom stage). All mutations also emit the
 * corresponding Socket.io event to the dealroom room if io is attached.
 */
'use strict';

const { Op }      = require('sequelize');
const { Dealroom, Message, User } = require('../models');
const { success } = require('../utils/response');
const AppError    = require('../utils/AppError');

const USER_ATTRS = ['id', 'first_name', 'last_name', 'email', 'role', 'profile_image', 'is_verified'];

/**
 * List all dealrooms for the authenticated user (as builder or investor).
 */
async function listDealrooms(req, res, next) {
  try {
    const userId = req.user.id;
    const role   = req.user.role;

    const where = role === 'builder'
      ? { builder_id:  userId }
      : { investor_id: userId };

    const dealrooms = await Dealroom.findAll({
      where,
      include: [
        { model: User, as: 'builder',  attributes: USER_ATTRS },
        { model: User, as: 'investor', attributes: USER_ATTRS },
        {
          model:      Message,
          as:         'messages',
          limit:      1,
          order:      [['created_at', 'DESC']],
          attributes: ['id', 'content', 'message_type', 'is_read', 'sender_id', 'created_at'],
        },
      ],
      order: [['last_message_at', 'DESC NULLS LAST'], ['created_at', 'DESC']],
    });

    // Attach unread count per dealroom
    const enriched = await Promise.all(
      dealrooms.map(async (dr) => {
        const unread = await Message.count({
          where: { dealroom_id: dr.id, is_read: false, sender_id: { [Op.ne]: userId } },
        });
        return { ...dr.toJSON(), unread_count: unread };
      })
    );

    res.json(success({ dealrooms: enriched }));
  } catch (err) {
    next(err);
  }
}

/**
 * Get a single dealroom with paginated message history.
 */
async function getDealroom(req, res, next) {
  try {
    const { id }  = req.params;
    const userId  = req.user.id;
    const page    = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit   = Math.min(50, parseInt(req.query.limit, 10) || 30);
    const offset  = (page - 1) * limit;

    const dealroom = await Dealroom.findOne({
      where: { id },
      include: [
        { model: User, as: 'builder',  attributes: USER_ATTRS },
        { model: User, as: 'investor', attributes: USER_ATTRS },
      ],
    });

    if (!dealroom) throw new AppError('Dealroom not found.', 404, 'DEALROOM_NOT_FOUND');

    // Ensure requester is a participant
    if (dealroom.builder_id !== userId && dealroom.investor_id !== userId) {
      throw new AppError('Access denied.', 403, 'FORBIDDEN');
    }

    const { count, rows: messages } = await Message.findAndCountAll({
      where:  { dealroom_id: id },
      include: [{ model: User, as: 'sender', attributes: USER_ATTRS }],
      order:  [['created_at', 'ASC']],
      limit,
      offset,
    });

    res.json(success({
      dealroom: dealroom.toJSON(),
      messages,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    }));
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new dealroom between a builder and investor.
 * Only investors can initiate (they reach out to builders).
 */
async function createDealroom(req, res, next) {
  try {
    const { builder_id, project_name } = req.body;
    const investor_id = req.user.id;

    if (req.user.role !== 'investor') {
      throw new AppError('Only investors can initiate dealrooms.', 403, 'FORBIDDEN');
    }

    // Prevent duplicate dealrooms for the same pair
    const existing = await Dealroom.findOne({ where: { builder_id, investor_id } });
    if (existing) {
      return res.json(success({ dealroom: existing.toJSON(), created: false }));
    }

    const builder = await User.findOne({ where: { id: builder_id, role: 'builder' } });
    if (!builder) throw new AppError('Builder not found.', 404, 'NOT_FOUND');

    const dealroom = await Dealroom.create({ builder_id, investor_id, project_name });

    res.status(201).json(success({ dealroom: dealroom.toJSON(), created: true }));
  } catch (err) {
    next(err);
  }
}

/**
 * Post a message to a dealroom via REST (socket fallback).
 */
async function sendMessage(req, res, next) {
  try {
    const { id }   = req.params;
    const senderId = req.user.id;
    const { content, message_type = 'text', file_url, file_name } = req.body;

    const dealroom = await Dealroom.findByPk(id);
    if (!dealroom) throw new AppError('Dealroom not found.', 404, 'DEALROOM_NOT_FOUND');

    if (dealroom.builder_id !== senderId && dealroom.investor_id !== senderId) {
      throw new AppError('Access denied.', 403, 'FORBIDDEN');
    }

    const message = await Message.create({
      dealroom_id:  id,
      sender_id:    senderId,
      content,
      message_type,
      file_url:     file_url  || null,
      file_name:    file_name || null,
    });

    await dealroom.update({ last_message_at: new Date() });

    // Emit via socket if io is attached
    const io = req.app.get('io');
    if (io) {
      const full = await Message.findByPk(message.id, {
        include: [{ model: User, as: 'sender', attributes: USER_ATTRS }],
      });
      io.to(`dealroom:${id}`).emit('new_message', { message: full });
    }

    res.status(201).json(success({ message: message.toJSON() }));
  } catch (err) {
    next(err);
  }
}

/**
 * Mark all unread messages in a dealroom as read (for the current user).
 */
async function markRead(req, res, next) {
  try {
    const { id }  = req.params;
    const userId  = req.user.id;

    const dealroom = await Dealroom.findByPk(id);
    if (!dealroom) throw new AppError('Dealroom not found.', 404, 'DEALROOM_NOT_FOUND');
    if (dealroom.builder_id !== userId && dealroom.investor_id !== userId) {
      throw new AppError('Access denied.', 403, 'FORBIDDEN');
    }

    await Message.update(
      { is_read: true },
      { where: { dealroom_id: id, is_read: false, sender_id: { [Op.ne]: userId } } }
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`dealroom:${id}`).emit('messages_marked_read', { dealroom_id: id, read_by: userId });
    }

    res.json(success({ message: 'Messages marked as read.' }));
  } catch (err) {
    next(err);
  }
}

/**
 * Update dealroom status (e.g. escalate to due_diligence).
 */
async function updateStatus(req, res, next) {
  try {
    const { id }     = req.params;
    const { status } = req.body;
    const userId     = req.user.id;

    const dealroom = await Dealroom.findByPk(id);
    if (!dealroom) throw new AppError('Dealroom not found.', 404, 'DEALROOM_NOT_FOUND');
    if (dealroom.builder_id !== userId && dealroom.investor_id !== userId) {
      throw new AppError('Access denied.', 403, 'FORBIDDEN');
    }

    await dealroom.update({ status });

    const io = req.app.get('io');
    if (io) {
      io.to(`dealroom:${id}`).emit('dealroom_updated', { dealroom_id: id, status });
    }

    res.json(success({ dealroom: dealroom.toJSON() }));
  } catch (err) {
    next(err);
  }
}

module.exports = { listDealrooms, getDealroom, createDealroom, sendMessage, markRead, updateStatus };
