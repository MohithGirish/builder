/*
 * database.js — Sequelize CLI and ORM database configuration.
 *
 * Exports environment-keyed configuration objects (development, test,
 * production) for PostgreSQL connections. All credentials are read from
 * environment variables. Production config enables SSL with a connection
 * pool of up to 20 connections; development uses a pool of 10. Also
 * used by sequelize-cli for migrations and seeders.
 */
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT, 10) || 5432,
    dialect:  'postgres',
    logging:  false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME + '_test',
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT, 10) || 5432,
    dialect:  'postgres',
    logging:  false,
  },
  production: {
    url:      process.env.DATABASE_URL,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT, 10) || 5432,
    dialect:  'postgres',
    logging:  false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    pool: { max: 20, min: 5, acquire: 30000, idle: 10000 },
  },
};
