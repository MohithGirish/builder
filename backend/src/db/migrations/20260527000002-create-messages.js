/*
 * 20260527000002-create-messages.js — Migration: create messages table.
 *
 * Creates the messages table for persistent dealroom chat storage. Columns
 * include UUID primary key, dealroom_id and sender_id foreign keys, text
 * content, message_type enum (text/file/image), optional file_url and
 * file_name for attachments, is_read boolean, and Sequelize timestamps. The
 * down migration drops the table.
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      dealroom_id: {
        type:      Sequelize.UUID,
        allowNull: false,
        references: { model: 'dealrooms', key: 'id' },
        onUpdate:  'CASCADE',
        onDelete:  'CASCADE',
      },
      sender_id: {
        type:      Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate:  'CASCADE',
        onDelete:  'CASCADE',
      },
      content: {
        type:      Sequelize.TEXT,
        allowNull: false,
      },
      message_type: {
        type:         Sequelize.ENUM('text', 'file', 'image'),
        allowNull:    false,
        defaultValue: 'text',
      },
      file_url: {
        type:      Sequelize.STRING(500),
        allowNull: true,
      },
      file_name: {
        type:      Sequelize.STRING(255),
        allowNull: true,
      },
      is_read: {
        type:         Sequelize.BOOLEAN,
        allowNull:    false,
        defaultValue: false,
      },
      created_at: {
        type:      Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type:      Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('messages', ['dealroom_id']);
    await queryInterface.addIndex('messages', ['sender_id']);
    await queryInterface.addIndex('messages', ['is_read']);
    await queryInterface.addIndex('messages', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('messages');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_messages_message_type";');
  },
};
