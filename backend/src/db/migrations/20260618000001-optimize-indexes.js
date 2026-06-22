/*
 * 20260618000001-optimize-indexes.js — Migration: query-pattern index tuning.
 *
 * Replaces single-column indexes with composite indexes that match the real
 * filter+ORDER BY query shapes, and swaps the dead btree indexes on the
 * ILIKE-filtered project columns (city, project_type) for pg_trgm GIN indexes
 * that a leading-wildcard ILIKE can actually use. Redundant single-column
 * indexes whose column is the leading column of a new composite are dropped to
 * cut write overhead. Idempotent (IF [NOT] EXISTS); the down migration restores
 * the original single-column indexes. Indexes are built/dropped CONCURRENTLY so
 * the migration never locks table writes — which means it must NOT run inside a
 * transaction (sequelize-cli does not wrap migrations by default). Postgres-only.
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    // ── messages: history load = WHERE dealroom_id ORDER BY created_at;
    //    unread count = WHERE dealroom_id AND is_read AND sender_id <> me ──
    await q('CREATE INDEX CONCURRENTLY IF NOT EXISTS messages_dealroom_id_created_at ON messages (dealroom_id, created_at);');
    await q('CREATE INDEX CONCURRENTLY IF NOT EXISTS messages_dealroom_id_is_read ON messages (dealroom_id, is_read);');
    await q('DROP INDEX CONCURRENTLY IF EXISTS messages_dealroom_id;'); // covered by the composites above
    await q('DROP INDEX CONCURRENTLY IF EXISTS messages_is_read;');     // low-cardinality alone; covered by composite

    // ── dealrooms: a user's room list = WHERE builder_id|investor_id
    //    ORDER BY last_message_at DESC ──
    await q('CREATE INDEX CONCURRENTLY IF NOT EXISTS dealrooms_builder_id_last_message_at ON dealrooms (builder_id, last_message_at);');
    await q('CREATE INDEX CONCURRENTLY IF NOT EXISTS dealrooms_investor_id_last_message_at ON dealrooms (investor_id, last_message_at);');
    await q('DROP INDEX CONCURRENTLY IF EXISTS dealrooms_builder_id;');
    await q('DROP INDEX CONCURRENTLY IF EXISTS dealrooms_investor_id;');

    // ── projects: listing = WHERE status|builder_id ORDER BY created_at DESC ──
    await q('CREATE INDEX CONCURRENTLY IF NOT EXISTS projects_status_created_at ON projects (status, created_at);');
    await q('CREATE INDEX CONCURRENTLY IF NOT EXISTS projects_builder_id_created_at ON projects (builder_id, created_at);');
    await q('DROP INDEX CONCURRENTLY IF EXISTS projects_status;');
    await q('DROP INDEX CONCURRENTLY IF EXISTS projects_builder_id;');

    // ── projects: city / project_type are filtered with ILIKE '%x%' (leading
    //    wildcard) — a btree index can't serve that, so use pg_trgm GIN ──
    await q('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
    await q('CREATE INDEX CONCURRENTLY IF NOT EXISTS projects_city_trgm ON projects USING gin (city gin_trgm_ops);');
    await q('CREATE INDEX CONCURRENTLY IF NOT EXISTS projects_project_type_trgm ON projects USING gin (project_type gin_trgm_ops);');
    await q('DROP INDEX CONCURRENTLY IF EXISTS projects_city;');
    await q('DROP INDEX CONCURRENTLY IF EXISTS projects_project_type;');
  },

  async down(queryInterface) {
    const q = (sql) => queryInterface.sequelize.query(sql);

    // Drop the composites / GIN indexes added above…
    await q('DROP INDEX CONCURRENTLY IF EXISTS messages_dealroom_id_created_at;');
    await q('DROP INDEX CONCURRENTLY IF EXISTS messages_dealroom_id_is_read;');
    await q('DROP INDEX CONCURRENTLY IF EXISTS dealrooms_builder_id_last_message_at;');
    await q('DROP INDEX CONCURRENTLY IF EXISTS dealrooms_investor_id_last_message_at;');
    await q('DROP INDEX CONCURRENTLY IF EXISTS projects_status_created_at;');
    await q('DROP INDEX CONCURRENTLY IF EXISTS projects_builder_id_created_at;');
    await q('DROP INDEX CONCURRENTLY IF EXISTS projects_city_trgm;');
    await q('DROP INDEX CONCURRENTLY IF EXISTS projects_project_type_trgm;');

    // …and restore the original single-column indexes.
    await q('CREATE INDEX CONCURRENTLY IF NOT EXISTS messages_dealroom_id ON messages (dealroom_id);');
    await q('CREATE INDEX CONCURRENTLY IF NOT EXISTS messages_is_read ON messages (is_read);');
    await q('CREATE INDEX CONCURRENTLY IF NOT EXISTS dealrooms_builder_id ON dealrooms (builder_id);');
    await q('CREATE INDEX CONCURRENTLY IF NOT EXISTS dealrooms_investor_id ON dealrooms (investor_id);');
    await q('CREATE INDEX CONCURRENTLY IF NOT EXISTS projects_status ON projects (status);');
    await q('CREATE INDEX CONCURRENTLY IF NOT EXISTS projects_builder_id ON projects (builder_id);');
    await q('CREATE INDEX CONCURRENTLY IF NOT EXISTS projects_city ON projects (city);');
    await q('CREATE INDEX CONCURRENTLY IF NOT EXISTS projects_project_type ON projects (project_type);');
    // pg_trgm extension is intentionally left installed (harmless; may be shared).
  },
};
