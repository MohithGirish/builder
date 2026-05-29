/*
 * Message.js — Sequelize model for dealroom chat messages.
 *
 * Stores individual messages within a dealroom. Fields include UUID primary
 * key, dealroom_id and sender_id foreign keys, text content, message_type
 * enum (text/file/image), optional file_url and file_name for attachments,
 * and an is_read boolean for unread-count tracking. Associates with Dealroom
 * (belongsTo) and User as sender (belongsTo).
 */
'use strict';

const { DataTypes, Model } = require('sequelize');

class Message extends Model {
  static associate(models) {
    Message.belongsTo(models.Dealroom, { as: 'dealroom', foreignKey: 'dealroom_id' });
    Message.belongsTo(models.User,     { as: 'sender',   foreignKey: 'sender_id' });
  }
}

function init(sequelize) {
  Message.init(
    {
      id: {
        type:         DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:   true,
      },
      dealroom_id: {
        type:      DataTypes.UUID,
        allowNull: false,
      },
      sender_id: {
        type:      DataTypes.UUID,
        allowNull: false,
      },
      content: {
        type:      DataTypes.TEXT,
        allowNull: false,
      },
      message_type: {
        type:         DataTypes.ENUM('text', 'file', 'image'),
        allowNull:    false,
        defaultValue: 'text',
      },
      file_url: {
        type:      DataTypes.STRING(500),
        allowNull: true,
      },
      file_name: {
        type:      DataTypes.STRING(255),
        allowNull: true,
      },
      is_read: {
        type:         DataTypes.BOOLEAN,
        allowNull:    false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName:   'Message',
      tableName:   'messages',
      underscored: true,
    }
  );
}

module.exports = { Message, init };
