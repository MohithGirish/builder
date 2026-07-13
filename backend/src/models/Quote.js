/*
 * Quote.js — Sequelize model for public quote requests.
 *
 * One row per "Request Quote" submission against a project. Holds the
 * requester's contact details and preferences, the builder's reply, and
 * `response_token` — the single credential that authorises
 * POST /quotes/respond/:token, so it must never be serialized to a client.
 * toSafeJSON() strips it (plus the internal account/project email) for the
 * public quote endpoints. Standalone: no associations, since project_id may
 * reference a slug or a since-deleted project.
 */
'use strict';

const { DataTypes, Model } = require('sequelize');

// Never leave the server. response_token is a bearer credential; account_email
// and project_email are internal routing, not the requester's business.
const PRIVATE_FIELDS = ['response_token', 'account_email', 'project_email'];

class Quote extends Model {
  /** Public-facing shape: camelCase, with the private fields removed. */
  toSafeJSON() {
    const row = this.get({ plain: true });
    for (const f of PRIVATE_FIELDS) delete row[f];
    return {
      id:                row.id,
      projectId:         row.project_id,
      projectName:       row.project_name,
      userName:          row.user_name,
      userEmail:         row.user_email,
      userPhone:         row.user_phone,
      layoutPreferences: row.layout_preferences,
      requirements:      row.requirements,
      whatsappConsent:   row.whatsapp_consent,
      status:            row.status,
      builderResponse:   row.builder_response,
      builderQuotePrice: row.builder_quote_price,
      builderTimeline:   row.builder_timeline,
      createdAt:         row.created_at,
      respondedAt:       row.responded_at,
    };
  }

  /** Shape the email templates expect (they read camelCase quote fields). */
  toEmailPayload() {
    const row = this.get({ plain: true });
    return {
      id:                row.id,
      projectId:         row.project_id,
      projectName:       row.project_name,
      projectEmail:      row.project_email,
      userName:          row.user_name,
      userEmail:         row.user_email,
      accountEmail:      row.account_email,
      userPhone:         row.user_phone,
      layoutPreferences: row.layout_preferences,
      requirements:      row.requirements,
      whatsappConsent:   row.whatsapp_consent,
      status:            row.status,
      builderResponse:   row.builder_response,
      builderQuotePrice: row.builder_quote_price,
      builderTimeline:   row.builder_timeline,
      createdAt:         row.created_at,
      respondedAt:       row.responded_at,
    };
  }
}

function init(sequelize) {
  Quote.init(
    {
      id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      project_id:    { type: DataTypes.STRING(120), allowNull: true },
      project_name:  { type: DataTypes.STRING(120), allowNull: false },
      project_email: { type: DataTypes.STRING(255), allowNull: false },
      user_name:     { type: DataTypes.STRING(120), allowNull: false },
      user_email:    { type: DataTypes.STRING(255), allowNull: false },
      account_email: { type: DataTypes.STRING(255), allowNull: true },
      user_phone:    { type: DataTypes.STRING(20),  allowNull: false },

      layout_preferences: { type: DataTypes.JSONB,   allowNull: false, defaultValue: [] },
      requirements:       { type: DataTypes.TEXT,    allowNull: false, defaultValue: '' },
      whatsapp_consent:   { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

      response_token: { type: DataTypes.UUID, allowNull: false, unique: true },
      status: {
        type:         DataTypes.ENUM('pending', 'responded'),
        allowNull:    false,
        defaultValue: 'pending',
      },
      builder_response:    { type: DataTypes.TEXT,        allowNull: true },
      builder_quote_price: { type: DataTypes.STRING(200), allowNull: true },
      builder_timeline:    { type: DataTypes.STRING(200), allowNull: true },
      responded_at:        { type: DataTypes.DATE,        allowNull: true },
    },
    {
      sequelize,
      modelName:   'Quote',
      tableName:   'quotes',
      underscored: true,
    }
  );
}

module.exports = { Quote, init };
