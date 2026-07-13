/*
 * import-quotes.js — one-shot migration of data/quotes.json into the quotes table.
 *
 * Run once per environment that still has the legacy flat file:
 *   node scripts/import-quotes.js [--dry-run]
 *
 * Idempotent: quotes already present (matched by id) are skipped, so re-running
 * is a no-op. Every imported quote gets a FRESH response_token — the old file
 * was committed to git at least once, so any token it contains must be treated
 * as public. Outstanding builder-response links for pending quotes therefore
 * stop working; that is the point.
 */
'use strict';

require('dotenv').config();

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const { sequelize, Quote } = require('../src/models');

const QUOTES_FILE = path.join(__dirname, '../data/quotes.json');
const DRY_RUN     = process.argv.includes('--dry-run');

async function main() {
  if (!fs.existsSync(QUOTES_FILE)) {
    console.log('[import-quotes] No data/quotes.json — nothing to do.');
    return;
  }

  const raw = fs.readFileSync(QUOTES_FILE, 'utf8').trim();
  const legacy = raw ? JSON.parse(raw) : [];
  if (legacy.length === 0) {
    console.log('[import-quotes] data/quotes.json is empty — nothing to do.');
    return;
  }

  await sequelize.authenticate();

  const existing = new Set(
    (await Quote.findAll({ attributes: ['id'] })).map((q) => q.id)
  );

  let imported = 0;
  let skipped  = 0;

  for (const q of legacy) {
    if (existing.has(q.id)) { skipped++; continue; }

    const row = {
      id:            q.id,
      project_id:    q.projectId ? String(q.projectId) : null,
      project_name:  q.projectName,
      project_email: q.projectEmail,
      user_name:     q.userName,
      user_email:    q.userEmail,
      account_email: q.accountEmail || null,
      user_phone:    q.userPhone,
      layout_preferences: Array.isArray(q.layoutPreferences) ? q.layoutPreferences : [],
      requirements:       q.requirements || '',
      whatsapp_consent:   q.whatsappConsent === true,
      // Rotated, never carried over: the legacy file reached git history.
      response_token:     crypto.randomUUID(),
      status:             q.status === 'responded' ? 'responded' : 'pending',
      builder_response:    q.builderResponse   || null,
      builder_quote_price: q.builderQuotePrice || null,
      builder_timeline:    q.builderTimeline   || null,
      created_at:   q.createdAt   ? new Date(q.createdAt)   : new Date(),
      updated_at:   new Date(),
      responded_at: q.respondedAt ? new Date(q.respondedAt) : null,
    };

    if (DRY_RUN) {
      console.log(`  would import ${row.id}  ${row.user_email}  (${row.status})`);
    } else {
      await Quote.create(row, { silent: true });
    }
    imported++;
  }

  console.log(
    `[import-quotes] ${DRY_RUN ? 'DRY RUN — ' : ''}${imported} imported, ${skipped} already present ` +
    `(${legacy.length} in file). Response tokens rotated.`
  );
  if (!DRY_RUN && imported > 0) {
    console.log('[import-quotes] Verify, then delete backend/data/quotes.json.');
  }
}

main()
  .then(() => sequelize.close())
  .catch(async (err) => {
    console.error('[import-quotes] FAILED:', err.message);
    await sequelize.close().catch(() => {});
    process.exit(1);
  });
