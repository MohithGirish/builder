'use strict';

/**
 * Jest globalSetup: runs once before all test suites.
 * Creates the test database tables via Sequelize sync.
 */
module.exports = async function globalSetup() {
  process.env.NODE_ENV = 'test';
  // Silence DB logs during tests
  process.env.DB_NAME  = process.env.DB_NAME || 'builder_ai_db';
};
