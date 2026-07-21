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
    // SSL stays ON by default: a managed production database (RDS, Neon, Render)
    // is reached over the network and must be encrypted. Set DB_SSL=false only
    // when Postgres is co-located and unreachable from outside -- e.g. the
    // container on the private compose bridge network, which does not speak SSL
    // at all and fails with "The server does not support SSL connections".
    dialectOptions:
      process.env.DB_SSL === 'false'
        ? {}
        : { ssl: { require: true, rejectUnauthorized: false } },
    pool: { max: 20, min: 2, acquire: 30000, idle: 10000 },
  },
};
