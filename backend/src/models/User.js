/*
 * User.js — Sequelize model for platform users.
 *
 * Defines the User model with fields: UUID primary key, unique email, bcrypt
 * password_hash, role enum (builder/investor/admin), first_name, last_name,
 * optional profile_image, is_verified, is_active, and builder-verification
 * columns (status enum + JSONB data + rejection reason + review timestamps).
 * Provides a toPublicJSON()
 * method that strips the password hash for safe API serialisation. Associates
 * with RefreshToken via a one-to-many relationship (hasMany).
 */
'use strict';

const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static associate(models) {
    User.hasMany(models.RefreshToken, {
      foreignKey: 'user_id',
      as: 'refreshTokens',
      onDelete: 'CASCADE',
    });
  }

  /** Returns a plain object safe for API responses (no password). */
  toPublicJSON() {
    return {
      id:            this.id,
      email:         this.email,
      role:          this.role,
      first_name:    this.first_name,
      last_name:     this.last_name,
      profile_image: this.profile_image,
      is_verified:   this.is_verified,
      is_active:     this.is_active,
      verification_status: this.verification_status,
      verification_reason: this.verification_reason,
      created_at:    this.created_at,
      updated_at:    this.updated_at,
    };
  }
}

/**
 * @param {import('sequelize').Sequelize} sequelize
 */
function init(sequelize) {
  User.init(
    {
      id: {
        type:         DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:   true,
      },
      email: {
        type:      DataTypes.STRING(255),
        allowNull: false,
        unique:    true,
        validate:  { isEmail: true },
      },
      password_hash: {
        type:      DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type:         DataTypes.ENUM('builder', 'investor', 'admin'),
        allowNull:    false,
        defaultValue: 'builder',
      },
      first_name: {
        type:      DataTypes.STRING(100),
        allowNull: false,
      },
      last_name: {
        type:      DataTypes.STRING(100),
        allowNull: false,
      },
      profile_image: {
        type:      DataTypes.STRING(500),
        allowNull: true,
      },
      is_verified: {
        type:         DataTypes.BOOLEAN,
        allowNull:    false,
        defaultValue: false,
      },
      is_active: {
        type:         DataTypes.BOOLEAN,
        allowNull:    false,
        defaultValue: true,
      },
      verification_status: {
        type:         DataTypes.ENUM('unverified', 'pending', 'approved', 'rejected'),
        allowNull:    false,
        defaultValue: 'unverified',
      },
      verification_data: {
        type:      DataTypes.JSONB,
        allowNull: true,
      },
      verification_reason: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
      verification_submitted_at: {
        type:      DataTypes.DATE,
        allowNull: true,
      },
      verification_reviewed_at: {
        type:      DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName:  'User',
      tableName:  'users',
      underscored: true,
      timestamps:  true,
      createdAt:   'created_at',
      updatedAt:   'updated_at',
    }
  );

  return User;
}

module.exports = { User, init };
