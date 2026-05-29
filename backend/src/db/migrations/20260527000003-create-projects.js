/*
 * 20260527000003-create-projects.js — Migration: create projects table.
 *
 * Creates the projects table for builder-owned investment projects. Columns
 * include UUID primary key, builder_id foreign key, name, description,
 * project_type, city, location, funding_target and funding_raised (decimal),
 * investor_count, view_count, status enum, RERA approval flag, optional
 * image_url, roi_projected, and Sequelize timestamps. The down migration drops
 * the table.
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('projects', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      builder_id: {
        type:      Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate:  'CASCADE',
        onDelete:  'CASCADE',
      },
      name: {
        type:      Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type:      Sequelize.TEXT,
        allowNull: true,
      },
      project_type: {
        type:      Sequelize.STRING(100),
        allowNull: true,
      },
      city: {
        type:      Sequelize.STRING(100),
        allowNull: true,
      },
      location: {
        type:      Sequelize.STRING(255),
        allowNull: true,
      },
      funding_target: {
        type:         Sequelize.DECIMAL(12, 2),
        allowNull:    false,
        defaultValue: 0,
      },
      funding_raised: {
        type:         Sequelize.DECIMAL(12, 2),
        allowNull:    false,
        defaultValue: 0,
      },
      investor_count: {
        type:         Sequelize.INTEGER,
        allowNull:    false,
        defaultValue: 0,
      },
      view_count: {
        type:         Sequelize.INTEGER,
        allowNull:    false,
        defaultValue: 0,
      },
      status: {
        type:         Sequelize.ENUM('active', 'completed', 'paused', 'draft'),
        allowNull:    false,
        defaultValue: 'draft',
      },
      rera_approved: {
        type:         Sequelize.BOOLEAN,
        allowNull:    false,
        defaultValue: false,
      },
      image_url: {
        type:      Sequelize.STRING(500),
        allowNull: true,
      },
      roi_projected: {
        type:      Sequelize.DECIMAL(5, 2),
        allowNull: true,
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

    await queryInterface.addIndex('projects', ['builder_id']);
    await queryInterface.addIndex('projects', ['status']);
    await queryInterface.addIndex('projects', ['city']);
    await queryInterface.addIndex('projects', ['project_type']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('projects');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_projects_status";');
  },
};
