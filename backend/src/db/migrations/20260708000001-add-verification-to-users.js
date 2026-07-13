/*
 * 20260708000001-add-verification-to-users.js — Sequelize migration:
 * add builder-verification columns to the users table.
 *
 * Adds verification_status (enum unverified/pending/approved/rejected),
 * verification_data (JSONB payload from the builder submission),
 * verification_reason (admin rejection note), and submitted/reviewed
 * timestamps. Backfills already-verified users to 'approved'. The down
 * migration removes the columns and drops the enum type.
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'verification_status', {
      type:         Sequelize.ENUM('unverified', 'pending', 'approved', 'rejected'),
      allowNull:    false,
      defaultValue: 'unverified',
    });
    await queryInterface.addColumn('users', 'verification_data', {
      type:      Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'verification_reason', {
      type:      Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'verification_submitted_at', {
      type:      Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'verification_reviewed_at', {
      type:      Sequelize.DATE,
      allowNull: true,
    });

    // Backfill: users already flagged verified are treated as approved.
    await queryInterface.sequelize.query(
      "UPDATE users SET verification_status='approved' WHERE is_verified=true;"
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'verification_reviewed_at');
    await queryInterface.removeColumn('users', 'verification_submitted_at');
    await queryInterface.removeColumn('users', 'verification_reason');
    await queryInterface.removeColumn('users', 'verification_data');
    await queryInterface.removeColumn('users', 'verification_status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_verification_status";');
  },
};
