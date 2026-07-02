/*
 * quote.controller.js — HTTP handlers for quote requests and site visits.
 *
 * Provides createQuote (POST /quotes), getQuote (GET /quotes/:id),
 * getQuoteByToken (GET /quotes/respond/:token), submitBuilderResponse
 * (POST /quotes/respond/:token), and scheduleSiteVisit (POST /quotes/site-visit).
 * Quotes are persisted to a local JSON file so the flow works without a
 * running PostgreSQL instance during development.
 */
'use strict';

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const email     = require('../services/email.service');
const whatsapp  = require('../services/whatsapp.service');

const QUOTES_FILE  = path.join(__dirname, '../../data/quotes.json');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function readQuotes() {
  try {
    const raw = fs.readFileSync(QUOTES_FILE, 'utf8').trim();
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQuotes(quotes) {
  fs.mkdirSync(path.dirname(QUOTES_FILE), { recursive: true });
  fs.writeFileSync(QUOTES_FILE, JSON.stringify(quotes, null, 2), 'utf8');
}

async function createQuote(req, res, next) {
  try {
    const {
      projectId, projectName, projectEmail,
      userName, userEmail, accountEmail, userPhone,
      whatsappConsent,
      layoutPreferences, requirements,
    } = req.body;

    const id            = crypto.randomUUID();
    const responseToken = crypto.randomUUID();
    const quote = {
      id,
      projectId,
      projectName,
      projectEmail,
      userName,
      userEmail,
      accountEmail: accountEmail || null,
      userPhone,
      layoutPreferences: Array.isArray(layoutPreferences) ? layoutPreferences : [],
      requirements:      requirements || '',
      whatsappConsent:   whatsappConsent === true,
      responseToken,
      status:            'pending',
      builderResponse:   null,
      builderQuotePrice: null,
      builderTimeline:   null,
      createdAt:         new Date().toISOString(),
      respondedAt:       null,
    };

    const quotes = readQuotes();
    quotes.push(quote);
    writeQuotes(quotes);

    const responseLink = `${FRONTEND_URL}/quote-response/${responseToken}`;

    const notifications = [
      email.sendQuoteRequestToBuilder({ quote, responseLink }),
      email.sendQuoteConfirmationToUser({ quote }),
    ];
    if (whatsappConsent === true) {
      notifications.push(whatsapp.sendQuoteConfirmation(quote.userPhone));
    }
    Promise.all(notifications).catch(err => console.error('[NOTIFICATION ERROR]', err.message));

    return res.status(201).json({
      success: true,
      data: { id, viewLink: `${FRONTEND_URL}/quote/${id}` },
    });
  } catch (err) {
    next(err);
  }
}

async function listQuotes(req, res, next) {
  try {
    const email        = (req.query.email || '').trim().toLowerCase();
    const projectEmail = (req.query.projectEmail || '').trim().toLowerCase();
    if (!email && !projectEmail) {
      return res.status(400).json({ success: false, error: { message: 'email or projectEmail query parameter is required.' } });
    }
    // email → quotes this user requested (investor side);
    // projectEmail → quotes against a builder's projects (builder side).
    const match = email
      ? (q) => (q.userEmail || '').toLowerCase() === email || (q.accountEmail || '').toLowerCase() === email
      : (q) => (q.projectEmail || '').toLowerCase() === projectEmail;
    const quotes = readQuotes()
      .filter(match)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(({ responseToken, accountEmail, ...safe }) => safe);
    return res.json({ success: true, data: quotes });
  } catch (err) {
    next(err);
  }
}

async function getQuote(req, res, next) {
  try {
    const { id } = req.params;
    const quotes  = readQuotes();
    const quote   = quotes.find(q => q.id === id);

    if (!quote) {
      return res.status(404).json({ success: false, error: { message: 'Quote not found.' } });
    }

    const { responseToken, projectEmail, accountEmail, ...safe } = quote;
    return res.json({ success: true, data: safe });
  } catch (err) {
    next(err);
  }
}

async function getQuoteByToken(req, res, next) {
  try {
    const { token } = req.params;
    const quotes    = readQuotes();
    const quote     = quotes.find(q => q.responseToken === token);

    if (!quote) {
      return res.status(404).json({ success: false, error: { message: 'Invalid or expired response token.' } });
    }

    const { responseToken, projectEmail, accountEmail, ...safe } = quote;
    return res.json({ success: true, data: safe });
  } catch (err) {
    next(err);
  }
}

async function submitBuilderResponse(req, res, next) {
  try {
    const { token } = req.params;
    const { builderResponse, builderQuotePrice, builderTimeline } = req.body;

    if (!builderResponse?.trim()) {
      return res.status(400).json({ success: false, error: { message: 'builderResponse is required.' } });
    }

    const quotes = readQuotes();
    const index  = quotes.findIndex(q => q.responseToken === token);

    if (index === -1) {
      return res.status(404).json({ success: false, error: { message: 'Invalid or expired response token.' } });
    }
    if (quotes[index].status === 'responded') {
      return res.status(400).json({ success: false, error: { message: 'This quote has already been responded to.' } });
    }

    quotes[index].builderResponse   = builderResponse.trim();
    quotes[index].builderQuotePrice = builderQuotePrice?.trim() || null;
    quotes[index].builderTimeline   = builderTimeline?.trim() || null;
    quotes[index].status            = 'responded';
    quotes[index].respondedAt       = new Date().toISOString();
    writeQuotes(quotes);

    const viewLink = `${FRONTEND_URL}/quote/${quotes[index].id}`;
    email.sendQuoteReadyToUser({ quote: quotes[index], viewLink })
      .catch(err => console.error('[EMAIL ERROR]', err.message));

    return res.json({ success: true, data: { viewLink } });
  } catch (err) {
    next(err);
  }
}

// Remove every quote request tied to a user's email (called on account deletion
// so the requester's PII doesn't linger in the flat-file store).
// ponytail: matches by email since quotes aren't linked to a user id; revisit if quotes move to a DB table with an FK.
function purgeQuotesByEmail(emailRaw) {
  const e = String(emailRaw || '').trim().toLowerCase();
  if (!e) return 0;
  const quotes = readQuotes();
  const kept = quotes.filter(
    (q) => (q.userEmail || '').toLowerCase() !== e && (q.accountEmail || '').toLowerCase() !== e,
  );
  if (kept.length !== quotes.length) writeQuotes(kept);
  return quotes.length - kept.length;
}

async function deleteQuote(req, res, next) {
  try {
    const { id } = req.params;
    const email  = (req.query.email || '').trim().toLowerCase();

    const quotes = readQuotes();
    const index  = quotes.findIndex((q) => q.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: { message: 'Quote not found.' } });
    }

    // Email-gated like listQuotes: only the requester may delete their own quote.
    // ponytail: email match, not real auth — same ceiling as the rest of the public
    // quote API. Swap for authenticate + req.user.id if quotes move behind login.
    const q = quotes[index];
    const owns = email && ((q.userEmail || '').toLowerCase() === email || (q.accountEmail || '').toLowerCase() === email);
    if (!owns) {
      return res.status(403).json({ success: false, error: { message: 'You can only delete your own quote requests.' } });
    }

    quotes.splice(index, 1);
    writeQuotes(quotes); // hard delete — the row and its reference ID are gone for good

    // Best-effort cancellation notice — wrapped so a missing/throwing send (even a
    // synchronous TypeError) can never turn a successful delete into a 500.
    Promise.resolve()
      .then(() => email.sendQuoteDeletedToUser({ quote: q }))
      .catch((err) => console.error('[EMAIL ERROR]', err.message));

    return res.json({ success: true, data: { id } });
  } catch (err) {
    next(err);
  }
}

async function scheduleSiteVisit(req, res, next) {
  try {
    const {
      projectName, projectEmail,
      visitorName, visitorEmail, visitorPhone,
      preferredDate, preferredTime, notes,
    } = req.body;

    email.sendSiteVisitRequest({
      projectName, projectEmail,
      visitorName, visitorEmail, visitorPhone,
      preferredDate, preferredTime, notes,
    }).catch(err => console.error('[EMAIL ERROR]', err.message));

    return res.status(201).json({ success: true, data: { message: 'Site visit request submitted.' } });
  } catch (err) {
    next(err);
  }
}

module.exports = { createQuote, listQuotes, getQuote, getQuoteByToken, submitBuilderResponse, deleteQuote, scheduleSiteVisit, purgeQuotesByEmail };
