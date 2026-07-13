/*
 * 20260710000002-create-quotes.js — Sequelize migration: quotes table.
 *
 * Replaces the flat-file store at backend/data/quotes.json, which:
 *   • vanished on every redeploy of an ephemeral filesystem;
 *   • diverged (or lost writes) the moment a second replica ran;
 *   • silently discarded EVERY quote if the file was ever truncated — readQuotes()
 *     swallowed the parse error and returned [], and the next submission wrote
 *     that empty array back over the file.
 * (Same-process concurrency was in fact safe: the read-modify-write was fully
 * synchronous, so the event loop could not interleave two handlers.)
 *
 * project_id is a plain string, not a UUID FK: the public POST /quotes body
 * allows any string projectId (see quote.validators.js), and a quote must
 * outlive deletion of the project it references — a FK would turn either case
 * into a 500 on a public endpoint. response_token is unique and indexed; it is
 * the sole credential for POST /quotes/respond/:token.
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quotes', {
      id:            { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      project_id:    { type: Sequelize.STRING(120), allowNull: true },
      project_name:  { type: Sequelize.STRING(120), allowNull: false },
      project_email: { type: Sequelize.STRING(255), allowNull: false },
      user_name:     { type: Sequelize.STRING(120), allowNull: false },
      user_email:    { type: Sequelize.STRING(255), allowNull: false },
      account_email: { type: Sequelize.STRING(255), allowNull: true },
      user_phone:    { type: Sequelize.STRING(20),  allowNull: false },

      layout_preferences: { type: Sequelize.JSONB,   allowNull: false, defaultValue: [] },
      requirements:       { type: Sequelize.TEXT,    allowNull: false, defaultValue: '' },
      whatsapp_consent:   { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

      response_token: { type: Sequelize.UUID, allowNull: false, unique: true },
      status: {
        type:         Sequelize.ENUM('pending', 'responded'),
        allowNull:    false,
        defaultValue: 'pending',
      },
      builder_response:    { type: Sequelize.TEXT,       allowNull: true },
      builder_quote_price: { type: Sequelize.STRING(200), allowNull: true },
      builder_timeline:    { type: Sequelize.STRING(200), allowNull: true },

      created_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      responded_at: { type: Sequelize.DATE, allowNull: true },
    });

    // listQuotes filters on exactly these, lowercased; created_at DESC orders them.
    await queryInterface.addIndex('quotes', ['user_email'],    { name: 'quotes_user_email_idx' });
    await queryInterface.addIndex('quotes', ['account_email'], { name: 'quotes_account_email_idx' });
    await queryInterface.addIndex('quotes', ['project_email'], { name: 'quotes_project_email_idx' });
    await queryInterface.addIndex('quotes', ['created_at'],    { name: 'quotes_created_at_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('quotes');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_quotes_status";');
  },
};
