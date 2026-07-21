/*
 * quote.routes.js — Express router for quote request and site visit endpoints.
 *
 * POST   /quotes               — create a new quote request (public)
 * GET    /quotes?email=        — list quotes a user requested (AUTH: own email only)
 * GET    /quotes?projectEmail=  — list quotes against a builder's projects
 *                                 (AUTH: scoped to projects the caller owns)
 * GET    /quotes/:id           — retrieve a quote by ID (public, for user view page)
 * DELETE /quotes/:id?email=    — delete own quote request (email-gated)
 * GET    /quotes/respond/:token — get quote data for builder response form (public)
 * POST   /quotes/respond/:token — submit builder's response (public, token-auth)
 * POST   /quotes/site-visit    — schedule a site visit (public)
 */
'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/quote.controller');
const authenticate = require('../middleware/authenticate');
const {
  validateCreateQuote,
  validateSiteVisit,
  validateBuilderResponse,
} = require('../validators/quote.validators');

const router = Router();

router.post('/',                    validateCreateQuote, ctrl.createQuote);
// Authenticated: the email in the query string is a filter, not a credential.
// Unauthenticated, this endpoint returned any builder's full lead list -- with
// requester names, emails and phone numbers -- to anyone who knew their address.
router.get('/',                     authenticate, ctrl.listQuotes);
router.post('/site-visit',          validateSiteVisit, ctrl.scheduleSiteVisit);
router.get('/respond/:token',       ctrl.getQuoteByToken);
router.post('/respond/:token',      validateBuilderResponse, ctrl.submitBuilderResponse);
router.get('/:id',                  ctrl.getQuote);
router.delete('/:id',               ctrl.deleteQuote);

module.exports = router;
