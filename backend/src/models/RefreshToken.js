/*
 * RefreshToken.js — Sequelize model for JWT refresh token storage.
 *
 * Stores hashed (SHA-256) refresh tokens linked to users with expiry timestamp,
 * revocation flag, and optional device metadata (user_agent, ip_address). The
 * isExpired() instance method checks whether the token has passed its expiry
 * date. Associates with User via a belongsTo relationship. Cascades deletes
 * from parent User.
 */
'use strict';

const { Model, DataTypes } = require('sequelize');

class RefreshToken extends Model {
  static associate(models) {
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  }

  isExpired() {
    return new Date() > this.expires_at;
  }
}

/**
 * @param {import('sequelize').Sequelize} sequelize
 */
function init(sequelize) {
  RefreshToken.init(
    {
      id: {
        type:         DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:   true,
      },
      user_id: {
        type:       DataTypes.UUID,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
      },
      token_hash: {
        type:      DataTypes.STRING(255),
        allowNull: false,
        unique:    true,
      },
      expires_at: {
        type:      DataTypes.DATE,
        allowNull: false,
      },
      is_revoked: {
        type:         DataTypes.BOOLEAN,
        allowNull:    false,
        defaultValue: false,
      },
      user_agent: {
        type:      DataTypes.STRING(500),
        allowNull: true,
      },
      ip_address: {
        type:      DataTypes.STRING(45),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName:  'RefreshToken',
      tableName:  'refresh_tokens',
      underscored: true,
      timestamps:  true,
      createdAt:   'created_at',
      updatedAt:   false,
    }
  );

  return RefreshToken;
}

module.exports = { RefreshToken, init };
