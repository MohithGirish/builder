/*
 * 20260527000001-create-dealrooms.js — Migration: create dealrooms table.
 *
 * Creates the dealrooms table which represents a private collaboration space
 * between a builder and an investor. Columns include UUID primary key,
 * builder_id and investor_id foreign keys referencing users, optional
 * project_name, a status enum for deal stage tracking, last_message_at
 * timestamp, and Sequelize timestamps. The down migration drops the table.
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dealrooms', {
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
      investor_id: {
        type:      Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate:  'CASCADE',
        onDelete:  'CASCADE',
      },
      project_name: {
        type:      Sequelize.STRING(255),
        allowNull: true,
      },
      status: {
        type:         Sequelize.ENUM('initial_discussion', 'due_diligence', 'term_sheet', 'closed', 'rejected'),
        allowNull:    false,
        defaultValue: 'initial_discussion',
      },
      last_message_at: {
        type:      Sequelize.DATE,
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

    await queryInterface.addIndex('dealrooms', ['builder_id']);
    await queryInterface.addIndex('dealrooms', ['investor_id']);
    await queryInterface.addIndex('dealrooms', ['status']);
    await queryInterface.addIndex('dealrooms', ['last_message_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('dealrooms');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_dealrooms_status";');
  },
};
