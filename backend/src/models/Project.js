/*
 * Project.js — Sequelize model for builder investment projects.
 *
 * Represents a real-estate or infrastructure project listed by a builder.
 * Fields include UUID primary key, builder_id foreign key, name, description,
 * project_type, city, location, funding_target and funding_raised (decimal),
 * investor_count, view_count, status enum, rera_approved flag, optional
 * image_url, and roi_projected. Exposes a funding_pct computed getter. Associates
 * with User as builder (belongsTo).
 */
'use strict';

const { DataTypes, Model } = require('sequelize');

class Project extends Model {
  static associate(models) {
    Project.belongsTo(models.User, { as: 'builder', foreignKey: 'builder_id' });
  }

  /** Funding completion percentage (0-100) */
  get funding_pct() {
    const target = parseFloat(this.funding_target) || 0;
    const raised = parseFloat(this.funding_raised) || 0;
    return target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  }
}

function init(sequelize) {
  Project.init(
    {
      id: {
        type:         DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:   true,
      },
      builder_id: {
        type:      DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type:      DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
      project_type: {
        type:      DataTypes.STRING(100),
        allowNull: true,
      },
      city: {
        type:      DataTypes.STRING(100),
        allowNull: true,
      },
      location: {
        type:      DataTypes.STRING(255),
        allowNull: true,
      },
      funding_target: {
        type:         DataTypes.DECIMAL(12, 2),
        allowNull:    false,
        defaultValue: 0,
      },
      funding_raised: {
        type:         DataTypes.DECIMAL(12, 2),
        allowNull:    false,
        defaultValue: 0,
      },
      investor_count: {
        type:         DataTypes.INTEGER,
        allowNull:    false,
        defaultValue: 0,
      },
      view_count: {
        type:         DataTypes.INTEGER,
        allowNull:    false,
        defaultValue: 0,
      },
      status: {
        type:         DataTypes.ENUM('active', 'completed', 'paused', 'draft'),
        allowNull:    false,
        defaultValue: 'draft',
      },
      rera_approved: {
        type:         DataTypes.BOOLEAN,
        allowNull:    false,
        defaultValue: false,
      },
      image_url: {
        type:      DataTypes.STRING(500),
        allowNull: true,
      },
      roi_projected: {
        type:      DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName:   'Project',
      tableName:   'projects',
      underscored: true,
      getterMethods: {
        funding_pct() {
          const target = parseFloat(this.funding_target) || 0;
          const raised = parseFloat(this.funding_raised) || 0;
          return target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
        },
      },
    }
  );
}

module.exports = { Project, init };
