/*
 * 20260526000001-admin-user.js — Sequelize seeder: initial admin user.
 *
 * Inserts a single admin account into the users table with a bcrypt-hashed
 * password, verified and active flags set to true, and a fixed deterministic
 * UUID. The down migration deletes the seeded admin record. Used to bootstrap
 * the platform with an admin login for local development and CI environments.
 */
'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('Admin@Builder123!', 12);

    await queryInterface.bulkInsert('users', [
      {
        id:            '00000000-0000-0000-0000-000000000001',
        email:         'admin@builderai.com',
        password_hash: passwordHash,
        role:          'admin',
        first_name:    'Platform',
        last_name:     'Admin',
        is_verified:   true,
        is_active:     true,
        created_at:    new Date(),
        updated_at:    new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: 'admin@builderai.com',
    });
  },
};
