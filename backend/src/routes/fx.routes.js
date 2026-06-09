/*
 * fx.routes.js — Express router for foreign-exchange rate endpoints.
 *
 * GET /fx/rates — returns cached INR→USD/AED/GBP conversion rates.
 * Public endpoint; no authentication required. Rate data is fetched from
 * ExchangeRate-API and cached in Redis to avoid hitting the upstream API
 * on every request.
 */
'use strict';

const { Router } = require('express');
const ctrl       = require('../controllers/fx.controller');

const router = Router();

router.get('/rates', ctrl.getRates);

module.exports = router;
