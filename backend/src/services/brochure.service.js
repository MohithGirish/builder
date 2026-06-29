/*
 * brochure.service.js — Claude-powered project brochure extraction.
 *
 * Takes an uploaded brochure (PDF or image) and asks Claude (model
 * claude-opus-4-8) to read it and emit structured listing fields via a forced
 * `extract_listing` tool call, so a builder can auto-fill the Add Project form
 * instead of typing everything. Returns { available:false } when
 * ANTHROPIC_API_KEY is unset (mirrors onboarding.service); only the fields the
 * brochure actually contains come back. Stateless — one API call per upload.
 */
'use strict';

const Anthropic = require('@anthropic-ai/sdk');

// ponytail: Opus for extraction quality from dense visual brochures; swap to
// 'claude-haiku-4-5' if per-upload cost matters more than fields captured.
const MODEL       = 'claude-opus-4-8';
const PDF_MEDIA   = 'application/pdf';
const IMAGE_MEDIA = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

let _client, _clientKey;
function getClient() {
  const key = (process.env.ANTHROPIC_API_KEY || '').trim();
  if (!key) return null; // feature off → caller falls back to manual entry
  if (!_client || _clientKey !== key) {
    _client = new Anthropic({ apiKey: key });
    _clientKey = key;
  }
  return _client;
}

// Mirrors the Add Project form fields. All optional — Claude omits what isn't
// in the brochure (no `strict`/`required`), so the client only overwrites the
// fields we actually found.
const LISTING_TOOL = {
  name: 'extract_listing',
  description:
    'Record the project listing details found in the brochure. Only include a field when the brochure clearly states it — omit anything not present, never guess.',
  input_schema: {
    type: 'object',
    properties: {
      name:                { type: 'string', description: 'Project name.' },
      tagline:             { type: 'string', description: 'Short marketing tagline.' },
      project_type:        { type: 'string', description: 'e.g. "Luxury Residential High-Rise", "Commercial Mixed-Use".' },
      category:            { type: 'string', description: 'One of: residential, commercial, mixed-use, infrastructure.' },
      construction_status: { type: 'string', description: 'e.g. "Under Construction", "Ready to Move".' },
      description:         { type: 'string', description: 'A paragraph describing the project.' },
      city:                { type: 'string', description: 'City.' },
      location:            { type: 'string', description: 'Area / locality, e.g. "Kokapet, Hyderabad".' },
      fullAddress:         { type: 'string', description: 'Full postal address.' },
      developer:           { type: 'string', description: 'Developer / builder name.' },
      phone:               { type: 'string' },
      email:               { type: 'string' },
      website:             { type: 'string' },
      priceRange:          { type: 'string', description: 'e.g. "₹75 Lakh – ₹1.5 Cr" or "₹8,000 – ₹15,000 / Sq.Ft.".' },
      funding_target:      { type: 'string', description: 'Funding target in ₹ Cr, if stated.' },
      roi_projected:       { type: 'string', description: 'Projected ROI %, if stated.' },
      possession:          { type: 'string', description: 'e.g. "Anticipated 2026".' },
      rera:                { type: 'string', description: 'RERA registration number.' },
      landArea:            { type: 'string' },
      towers:              { type: 'string' },
      floors:              { type: 'string' },
      totalUnits:          { type: 'string' },
      unitTypes:           { type: 'string', description: 'e.g. "2 BHK & 3 BHK".' },
      unitSizes:           { type: 'string' },
      parking:             { type: 'string' },
      totalOfficeArea:     { type: 'string' },
      coworkingArea:       { type: 'string' },
      officeSizes:         { type: 'string' },
      highlights:          { type: 'string', description: 'Key highlights, one "Label: Value" per line.' },
      amenities:           { type: 'string', description: 'Amenities, one per line.' },
      specifications:      { type: 'string', description: 'Technical specifications, one "Label: Value" per line.' },
    },
  },
};

/**
 * Extract listing fields from an uploaded brochure.
 * @param {{ buffer: Buffer, mimetype: string }} file
 * @returns {Promise<{available:boolean, fields?:object}>}
 */
async function extractBrochure({ buffer, mimetype }) {
  const client = getClient();
  if (!client) return { available: false };

  const data  = buffer.toString('base64');
  const block = mimetype === PDF_MEDIA
    ? { type: 'document', source: { type: 'base64', media_type: PDF_MEDIA, data } }
    : { type: 'image',    source: { type: 'base64', media_type: mimetype,  data } };

  const resp = await client.messages.create({
    model:       MODEL,
    max_tokens:  2048,
    tools:       [LISTING_TOOL],
    tool_choice: { type: 'tool', name: 'extract_listing' }, // force structured output
    messages: [{
      role: 'user',
      content: [
        block, // document/image must precede the text block
        { type: 'text', text: 'This is a real estate project brochure. Read it carefully and extract the listing fields with the extract_listing tool. Include only details actually present in the brochure.' },
      ],
    }],
  });

  const toolUse = resp.content.find((b) => b.type === 'tool_use' && b.name === 'extract_listing');
  const fields  = toolUse?.input || {};
  // Drop empties so we never blank out a form field the brochure didn't cover.
  const clean = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => typeof v === 'string' && v.trim())
  );
  return { available: true, fields: clean };
}

module.exports = { extractBrochure, IMAGE_MEDIA, PDF_MEDIA };
