/*
 * 20260710000001-add-content-slug-to-projects.js — Sequelize migration.
 *
 * Adds two columns to `projects`:
 *   • content JSONB (nullable) — the detail-page display payload that has no
 *     scalar column: coordinates, images gallery, highlights, sections
 *     (floorBreakdown / unitTypes / amenities / specifications / nearby), and
 *     the statutory + spec strings (rera, hmda, landArea, floors, possession…).
 *   • slug STRING(120), unique (nullable) — the human URL id, e.g. /projects/one-downtown.
 * Content is display payload, not queryable domain data, so it stays in one JSONB
 * column rather than ~20 scalar columns.
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('projects', 'content', {
      type:      Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn('projects', 'slug', {
      type:      Sequelize.STRING(120),
      allowNull: true,
      unique:    true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('projects', 'slug');
    await queryInterface.removeColumn('projects', 'content');
  },
};
