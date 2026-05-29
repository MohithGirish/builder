/*
 * Dealroom.js — Sequelize model for deal collaboration rooms.
 *
 * Represents a private collaboration space between one builder and one investor
 * for a specific project. Fields include UUID primary key, builder_id and
 * investor_id foreign keys, optional project_name, a status enum tracking the
 * deal stage, and last_message_at timestamp. Associates with User (as builder
 * and investor) and has many Messages with CASCADE delete.
 */
'use strict';

const { DataTypes, Model } = require('sequelize');

class Dealroom extends Model {
  static associate(models) {
    Dealroom.belongsTo(models.User, { as: 'builder',  foreignKey: 'builder_id' });
    Dealroom.belongsTo(models.User, { as: 'investor', foreignKey: 'investor_id' });
    Dealroom.hasMany(models.Message, { as: 'messages', foreignKey: 'dealroom_id', onDelete: 'CASCADE' });
  }
}

function init(sequelize) {
  Dealroom.init(
    {
      id: {
        type:         DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:   true,
      },
      builder_id: {
        type:      DataTypes.UUID,
        allowNull: false,
      },
      investor_id: {
        type:      DataTypes.UUID,
        allowNull: false,
      },
      project_name: {
        type:      DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type:         DataTypes.ENUM('initial_discussion', 'due_diligence', 'term_sheet', 'closed', 'rejected'),
        allowNull:    false,
        defaultValue: 'initial_discussion',
      },
      last_message_at: {
        type:      DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName:  'Dealroom',
      tableName:  'dealrooms',
      underscored: true,
    }
  );
}

module.exports = { Dealroom, init };
