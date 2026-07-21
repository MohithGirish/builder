/*
 * 20260627000001-einfra-builder.js — Sequelize seeder: E-Infra builder account.
 *
 * Upserts the builder (E-Infra Developers, builder@e-infra.in) that owns the five
 * onboarded Hyderabad projects and receives the quote requests raised against them,
 * using a fixed deterministic UUID. The password comes from EINFRA_PASSWORD; in
 * production that variable is REQUIRED and the seeder throws without it. Outside
 * production it falls back to a well-known local development password. Like the
 * admin seeder, it refuses to overwrite a pre-existing account that is not already
 * this builder. The down migration deletes the record.
 */
'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');

const BUILDER_UUID = '00000000-0000-0000-0000-000000000002';
const BUILDER_EMAIL = 'builder@e-infra.in';

// Local-only convenience credential. This value is in public git history, so it
// must never reach a deployed environment: this account is a VERIFIED builder that
// owns the showcase projects and can read every quote request raised against them,
// including requesters' names, emails and phone numbers. Anyone who can read the
// repo would have those. Hence the hard block below when NODE_ENV=production.
const DEV_FALLBACK_PASSWORD = 'Einfra@Builder123!';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const isProd = process.env.NODE_ENV === 'production';
    const password = process.env.EINFRA_PASSWORD || (isProd ? null : DEV_FALLBACK_PASSWORD);

    if (!password) {
      throw new Error(
        '[SEED] EINFRA_PASSWORD must be set to seed the E-Infra builder in production. ' +
        'This account is a verified builder that owns the showcase projects and can read ' +
        'every quote request against them, so it must not use the public development password. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(24).toString(\'base64url\'))"'
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();

    const [existing] = await queryInterface.sequelize.query(
      'SELECT id, role FROM users WHERE email = :email LIMIT 1;',
      { replacements: { email: BUILDER_EMAIL }, type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (existing) {
      // Only ever rotate the seeded account itself. A row under this email that is
      // not the deterministic builder belongs to someone else; overwriting it would
      // hand its projects and quote requests to whoever runs the seeder.
      if (existing.id !== BUILDER_UUID) {
        throw new Error(
          `[SEED] Refusing to seed the E-Infra builder: a different account (role="${existing.role}") ` +
          `already exists with email "${BUILDER_EMAIL}". Remove it first, or change the seeded email.`
        );
      }
      await queryInterface.bulkUpdate('users', {
        password_hash: passwordHash,
        updated_at:    now,
      }, { id: BUILDER_UUID });
      return;
    }

    await queryInterface.bulkInsert('users', [
      {
        id:                  BUILDER_UUID,
        email:               BUILDER_EMAIL,
        password_hash:       passwordHash,
        role:                'builder',
        first_name:          'E-Infra',
        last_name:           'Developers',
        is_verified:         true,
        verification_status: 'approved',
        is_active:           true,
        created_at:          now,
        updated_at:          now,
      },
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: BUILDER_EMAIL });
  },
};
