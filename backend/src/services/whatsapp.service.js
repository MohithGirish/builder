/*
 * whatsapp.service.js — WhatsApp Business Cloud API wrapper for Builder AI.
 *
 * Sends the pre-approved "quote_confirmation" template message to a client
 * phone number via Meta's Graph API immediately after a quote is submitted.
 * Uses only the Node.js built-in `https` module — no extra dependencies.
 *
 * Falls back to console logging when env vars are absent so the rest of
 * the quote flow still works in development without a real WhatsApp setup.
 *
 * Env vars: WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN,
 *           WHATSAPP_TEMPLATE_NAME (default: quote_confirmation),
 *           WHATSAPP_API_VERSION   (default: v21.0),
 *           WHATSAPP_DEFAULT_COUNTRY_CODE (default: 91 — India).
 */
'use strict';

const https = require('https');

const API_VERSION   = process.env.WHATSAPP_API_VERSION    || 'v21.0';
const PHONE_ID      = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN  = process.env.WHATSAPP_ACCESS_TOKEN;
const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME  || 'quote_confirmation';
const DEFAULT_CC    = (process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || '91').replace(/\D/g, '');

function isConfigured() {
  return !!(PHONE_ID && ACCESS_TOKEN);
}

// Normalise to E.164. A bare national number (no leading +, no 00 prefix) gets
// the default country code prepended — Meta rejects national-only numbers.
// ponytail: single default CC; add per-number country detection only if the app goes multi-country.
function toE164(phone) {
  const s = String(phone).trim();
  if (s.startsWith('+')) return '+' + s.slice(1).replace(/\D/g, '');
  let digits = s.replace(/\D/g, '');
  if (digits.startsWith('00')) return '+' + digits.slice(2);  // 00 = international dialling prefix
  if (digits.length <= 10)     digits = DEFAULT_CC + digits;  // national number → add country code
  return '+' + digits;
}

function graphPost(apiPath, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request(
      {
        hostname: 'graph.facebook.com',
        path:     apiPath,
        method:   'POST',
        timeout:  8000,
        headers: {
          Authorization:   `Bearer ${ACCESS_TOKEN}`,
          'Content-Type':  'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(json);
            } else {
              reject(new Error(`WhatsApp API ${res.statusCode}: ${data}`));
            }
          } catch (e) {
            reject(new Error(`WhatsApp response parse error: ${data}`));
          }
        });
      },
    );
    req.on('timeout', () => req.destroy(new Error('WhatsApp request timeout')));
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function sendQuoteConfirmation(phone) {
  const to = toE164(phone);

  if (!isConfigured()) {
    console.log('\n[WHATSAPP — dev mode, no credentials configured]');
    console.log(`  Would send template "${TEMPLATE_NAME}" to: ${to}\n`);
    return { mocked: true };
  }

  return graphPost(`/${API_VERSION}/${PHONE_ID}/messages`, {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name:     TEMPLATE_NAME,
      language: { code: 'en' },
    },
  });
}

module.exports = { sendQuoteConfirmation };

// ponytail: runnable self-check — `node whatsapp.service.js` asserts E.164 normalisation.
if (require.main === module) {
  const assert = require('assert');
  assert.strictEqual(toE164('9876543210'),      '+919876543210'); // national → CC prepended
  assert.strictEqual(toE164('+91 98765 43210'), '+919876543210'); // already international
  assert.strictEqual(toE164('0091-9876543210'), '+919876543210'); // 00 dialling prefix
  assert.strictEqual(toE164('(987) 654-3210'),  '+919876543210'); // punctuation stripped
  console.log('whatsapp toE164 self-check passed');
}
