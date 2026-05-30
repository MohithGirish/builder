/*
 * models/index.js — Sequelize instance bootstrap and model registry.
 *
 * Creates the Sequelize connection using the environment-appropriate config,
 * initialises all five models (User, RefreshToken, Dealroom, Message, Project),
 * sets up their inter-model associations (hasMany, belongsTo), and re-exports
 * the sequelize instance along with all model classes for use throughout the
 * application.
 */
'use strict';

require('dotenv').config();

const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const env  = process.env.NODE_ENV || 'development';
const conf = dbConfig[env];

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, conf)
  : new Sequelize(conf.database, conf.username, conf.password, conf);

// Import model initialisers
const { User,        init: initUser }        = require('./User');
const { RefreshToken, init: initRefreshToken } = require('./RefreshToken');
const { Dealroom,    init: initDealroom }    = require('./Dealroom');
const { Message,     init: initMessage }     = require('./Message');
const { Project,     init: initProject }     = require('./Project');

// Initialise models
initUser(sequelize);
initRefreshToken(sequelize);
initDealroom(sequelize);
initMessage(sequelize);
initProject(sequelize);

// Set up associations
const models = { User, RefreshToken, Dealroom, Message, Project };
Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

module.exports = { sequelize, Sequelize, ...models };
