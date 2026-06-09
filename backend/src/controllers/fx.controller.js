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
const AppError          = require('../utils/AppError');
const { getCache, setCache } = require('../services/redis.service');

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
    const cached = await getCache(FX_CACHE_KEY);
    if (cached) {
      return res.json({
        success: true,
        data: { ...cached, source: 'cache' },
      });
    }

    let rates;
    let fallback = false;
    try {
      rates = await fetchLiveRates();
    } catch (err) {
      console.warn('[FX] Live rate fetch failed, using fallback:', err.message);
      rates    = FALLBACK_RATES;
      fallback = true;
    }

    const updatedAt = new Date().toISOString();
    if (!fallback) {
      await setCache(FX_CACHE_KEY, { rates, updatedAt }, FX_TTL);
    }

    return res.json({
      success: true,
      data: { rates, updatedAt, source: fallback ? 'fallback' : 'live' },
    });
  } catch (err) {
    next(err);
  }
};
