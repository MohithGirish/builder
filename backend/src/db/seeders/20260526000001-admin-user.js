/*
 * 20260526000001-admin-user.js — Sequelize seeder: initial admin user.
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD from the environment (backend/.env) and
 * upserts a single admin account: fresh inserts get a fixed deterministic UUID,
 * an existing ADMIN row with that email has its password_hash/flags rotated. If
 * a row exists with that email but is NOT already an admin the seeder throws
 * (never silently escalating a real user). If either variable is unset the
 * seeder throws so a fresh clone fails loudly instead of ending up admin-less;
 * it never falls back to a hardcoded credential. Skips quietly only under
 * NODE_ENV=test (the jest suite bootstraps via sequelize.sync, not seeders).
 * The down migration deletes the record.
 */
'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');

const ADMIN_UUID = '00000000-0000-0000-0000-000000000001';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const email    = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      // Tests bootstrap the DB with sequelize.sync (no seeders), so they must
      // not depend on these vars — skip quietly there only.
      if (process.env.NODE_ENV === 'test') return;
      throw new Error(
        '[SEED] ADMIN_EMAIL and ADMIN_PASSWORD must both be set in backend/.env to seed the platform admin account. ' +
        'Without an admin, /admin is unreachable and builder verifications cannot be approved. ' +
        'Generate a strong password with: node -e "console.log(require(\'crypto\').randomBytes(24).toString(\'base64url\'))". ' +
        '(The seeder never falls back to a hardcoded password.)'
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now          = new Date();

    // Upsert semantics: rotate credentials only if the email already belongs to
    // an admin, otherwise insert a fresh row with the deterministic UUID. A
    // pre-existing NON-admin row is never mutated — doing so would silently take
    // over a real user's account and escalate them to admin.
    const [existing] = await queryInterface.sequelize.query(
      'SELECT id, role FROM users WHERE email = :email LIMIT 1;',
      { replacements: { email }, type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (existing) {
      if (existing.role !== 'admin') {
        throw new Error(
          `[SEED] Refusing to seed admin: a non-admin account (role="${existing.role}") already exists with email "${email}". ` +
          'Overwriting it would hijack that user and escalate them to admin. ' +
          'Pick a different ADMIN_EMAIL, or remove the conflicting account first.'
        );
      }
      await queryInterface.bulkUpdate('users', {
        password_hash:       passwordHash,
        role:                'admin',
        is_verified:         true,
        is_active:           true,
        verification_status: 'approved',
        updated_at:          now,
      }, { email });
      return;
    }

    // No row under this email, but the deterministic admin row may already exist
    // under a PREVIOUS ADMIN_EMAIL. Falling through to the insert would hit a
    // primary-key conflict that `ignoreDuplicates` swallows silently -- the
    // seeder would report success while the admin email stayed unchanged. Treat
    // a changed ADMIN_EMAIL as a rename of the existing admin instead.
    const [byUuid] = await queryInterface.sequelize.query(
      'SELECT id, email FROM users WHERE id = :id LIMIT 1;',
      { replacements: { id: ADMIN_UUID }, type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (byUuid) {
      await queryInterface.bulkUpdate('users', {
        email,
        password_hash:       passwordHash,
        role:                'admin',
        is_verified:         true,
        is_active:           true,
        verification_status: 'approved',
        updated_at:          now,
      }, { id: ADMIN_UUID });
      return;
    }

    await queryInterface.bulkInsert('users', [
      {
        id:                  ADMIN_UUID,
        email,
        password_hash:       passwordHash,
        role:                'admin',
        first_name:          'Platform',
        last_name:           'Admin',
        is_verified:         true,
        is_active:           true,
        verification_status: 'approved',
        created_at:          now,
        updated_at:          now,
      },
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    const email = process.env.ADMIN_EMAIL;
    if (!email) return;
    await queryInterface.bulkDelete('users', { email });
  },
};
