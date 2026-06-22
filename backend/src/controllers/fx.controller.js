/*
 * fx.controller.js — Foreign-exchange rate controller.
 *
 * Exposes getRates() which returns live INR→USD/AED/GBP conversion rates.
 * Rates are fetched from the keyless ExchangeRate-API (open.er-api.com) and
 * cached in Redis (with an in-memory fallback) for FX_TTL seconds to avoid
 * hammering the upstream API. On fetch failure the endpoint returns a set of
 * hardcoded approximate rates along with a "fallback" flag so the frontend
 * can display a "live rates unavailable" notice without breaking the page.
 */
'use strict';

const https             = require('https');
const { cacheAside }     = require('../services/redis.service');

const FX_CACHE_KEY = 'fx:rates:inr';
const FX_TTL       = 2 * 60 * 60; // 2 hours in seconds

// Approximate hardcoded rates used only when the live API is unreachable
const FALLBACK_RATES = { USD: 0.012, AED: 0.044, GBP: 0.0095 };

function fetchLiveRates() {
  return new Promise((resolve, reject) => {
    const req = https.get(
      'https://open.er-api.com/v6/latest/INR',
      { timeout: 8000 },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        let raw = '';
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(raw);
            if (json.result !== 'success') return reject(new Error('API result not success'));
            resolve({
              USD: json.rates.USD,
              AED: json.rates.AED,
              GBP: json.rates.GBP,
            });
          } catch (e) { reject(e); }
        });
      }
    );
    req.on('error',   (e) => reject(e));
    req.on('timeout', ()  => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

exports.getRates = async (req, res, next) => {
  try {
    // Read-through cache: only successful live fetches are cached (cacheAside
    // caches the producer's return value; a throw propagates and is never
    // cached, so the fallback below is always fresh).
    let payload;
    try {
      payload = await cacheAside(FX_CACHE_KEY, FX_TTL, async () => ({
        rates:     await fetchLiveRates(),
        updatedAt: new Date().toISOString(),
        source:    'live',
      }));
    } catch (err) {
      console.warn('[FX] Live rate fetch failed, using fallback:', err.message);
      payload = { rates: FALLBACK_RATES, updatedAt: new Date().toISOString(), source: 'fallback' };
    }

    return res.json({ success: true, data: payload });
  } catch (err) {
    next(err);
  }
};
