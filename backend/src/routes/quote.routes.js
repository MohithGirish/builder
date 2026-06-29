/*
 * quote.routes.js — Express router for quote request and site visit endpoints.
 *
 * POST   /quotes               — create a new quote request (public)
 * GET    /quotes?email=        — list quotes a user requested (investor side)
 * GET    /quotes?projectEmail=  — list quotes against a builder's projects
 * GET    /quotes/:id           — retrieve a quote by ID (public, for user view page)
 * DELETE /quotes/:id?email=    — delete own quote request (email-gated)
 * GET    /quotes/respond/:token — get quote data for builder response form (public)
 * POST   /quotes/respond/:token — submit builder's response (public, token-auth)
 * POST   /quotes/site-visit    — schedule a site visit (public)
 */
'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/quote.controller');

const router = Router();

router.post('/',                    ctrl.createQuote);
router.get('/',                     ctrl.listQuotes);
router.post('/site-visit',          ctrl.scheduleSiteVisit);
router.get('/respond/:token',       ctrl.getQuoteByToken);
router.post('/respond/:token',      ctrl.submitBuilderResponse);
router.get('/:id',                  ctrl.getQuote);
router.delete('/:id',               ctrl.deleteQuote);

module.exports = router;
