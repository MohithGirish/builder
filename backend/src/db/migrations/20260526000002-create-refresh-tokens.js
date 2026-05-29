/*
 * 20260526000002-create-refresh-tokens.js — Migration: create refresh_tokens table.
 *
 * Creates the refresh_tokens table storing hashed JWT refresh tokens linked
 * to users. Columns include UUID primary key, user_id foreign key (CASCADE
 * delete), SHA-256 token_hash (unique), expires_at timestamp, revocation flag,
 * and optional user_agent and ip_address for device tracking. The down
 * migration drops the table.
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      user_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',
      },
      token_hash: {
        type:      Sequelize.STRING(255),
        allowNull: false,
        unique:    true,
      },
      expires_at: {
        type:      Sequelize.DATE,
        allowNull: false,
      },
      is_revoked: {
        type:         Sequelize.BOOLEAN,
        allowNull:    false,
        defaultValue: false,
      },
      user_agent: {
        type:      Sequelize.STRING(500),
        allowNull: true,
      },
      ip_address: {
        type:      Sequelize.STRING(45),
        allowNull: true,
      },
      created_at: {
        type:         Sequelize.DATE,
        allowNull:    false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('refresh_tokens', ['user_id']);
    await queryInterface.addIndex('refresh_tokens', ['token_hash']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('refresh_tokens');
  },
};
