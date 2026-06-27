/*
 * 20260627000001-einfra-builder.js — Sequelize seeder: E-Infra test builder.
 *
 * Inserts a builder account (E-Infra Developers, builder@e-infra.in) with a
 * bcrypt-hashed password and a fixed deterministic UUID. This is the test
 * builder that owns the five onboarded Hyderabad projects and receives the
 * quote requests raised against them. The down migration deletes the record.
 */
'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('Einfra@Builder123!', 12);

    await queryInterface.bulkInsert('users', [
      {
        id:            '00000000-0000-0000-0000-000000000002',
        email:         'builder@e-infra.in',
        password_hash: passwordHash,
        role:          'builder',
        first_name:    'E-Infra',
        last_name:     'Developers',
        is_verified:   true,
        is_active:     true,
        created_at:    new Date(),
        updated_at:    new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: 'builder@e-infra.in',
    });
  },
};
