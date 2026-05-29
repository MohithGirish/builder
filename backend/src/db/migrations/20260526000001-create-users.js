/*
 * 20260526000001-create-users.js — Sequelize migration: create users table.
 *
 * Creates the users table with UUID primary key, unique email, bcrypt password
 * hash, role enum (builder/investor/admin), first and last name, optional
 * profile image URL, verified and active boolean flags, and standard
 * created_at/updated_at timestamps. The down migration drops the table.
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      email: {
        type:      Sequelize.STRING(255),
        allowNull: false,
        unique:    true,
      },
      password_hash: {
        type:      Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type:         Sequelize.ENUM('builder', 'investor', 'admin'),
        allowNull:    false,
        defaultValue: 'builder',
      },
      first_name: {
        type:      Sequelize.STRING(100),
        allowNull: false,
      },
      last_name: {
        type:      Sequelize.STRING(100),
        allowNull: false,
      },
      profile_image: {
        type:      Sequelize.STRING(500),
        allowNull: true,
      },
      is_verified: {
        type:         Sequelize.BOOLEAN,
        allowNull:    false,
        defaultValue: false,
      },
      is_active: {
        type:         Sequelize.BOOLEAN,
        allowNull:    false,
        defaultValue: true,
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

    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['role']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
  },
};
