/*
 * quote.controller.js — HTTP handlers for quote requests and site visits.
 *
 * Provides createQuote (POST /quotes), listQuotes (GET /quotes), getQuote
 * (GET /quotes/:id), getQuoteByToken (GET /quotes/respond/:token),
 * submitBuilderResponse (POST /quotes/respond/:token), deleteQuote
 * (DELETE /quotes/:id) and scheduleSiteVisit (POST /quotes/site-visit).
 * Quotes are rows in the `quotes` table; responses never include the
 * response_token (see Quote.toSafeJSON). Also exports countQuotes and
 * purgeQuotesByEmail for the admin dashboard and account deletion.
 */
'use strict';

const crypto = require('crypto');
const { Op } = require('sequelize');
const emailService = require('../services/email.service');
const whatsapp     = require('../services/whatsapp.service');
const { User, Project, Quote } = require('../models');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Project ids are UUID primary keys. Guard the socket lookup so a slug or other
// non-UUID projectId is skipped before findByPk (which would otherwise throw a
// Postgres "invalid input syntax for type uuid" error on every submission).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const lower = (v) => String(v || '').trim().toLowerCase();

async function createQuote(req, res, next) {
  try {
    const {
      projectId, projectName, projectEmail,
      userName, userEmail, accountEmail, userPhone,
      whatsappConsent,
      layoutPreferences, requirements,
    } = req.body;

    const responseToken = crypto.randomUUID();

    const quote = await Quote.create({
      project_id:    projectId ? String(projectId) : null,
      project_name:  projectName,
      project_email: projectEmail,
      user_name:     userName,
      user_email:    userEmail,
      account_email: accountEmail || null,
      user_phone:    userPhone,
      layout_preferences: Array.isArray(layoutPreferences) ? layoutPreferences : [],
      requirements:       requirements || '',
      whatsapp_consent:   whatsappConsent === true,
      response_token:     responseToken,
      status:             'pending',
    });

    const payload      = quote.toEmailPayload();
    const responseLink = `${FRONTEND_URL}/quote-response/${responseToken}`;

    const notifications = [
      emailService.sendQuoteRequestToBuilder({ quote: payload, responseLink }),
      emailService.sendQuoteConfirmationToUser({ quote: payload }),
    ];
    if (whatsappConsent === true) {
      notifications.push(whatsapp.sendQuoteConfirmation(payload.userPhone));
    }
    Promise.all(notifications).catch(err => console.error('[NOTIFICATION ERROR]', err.message));

    // Best-effort real-time nudge to the builder who genuinely owns the
    // referenced project. This endpoint is PUBLIC, so we must NOT let an
    // anonymous caller push a toast to arbitrary users: authority on ownership
    // is Project.builder_id (projectEmail is only a contact inbox, not an
    // identity), so we resolve the target from the project row and emit only to
    // its owning builder. Display text comes from the trusted DB row, never from
    // the caller-supplied body. Fully wrapped so it can never fail or delay the
    // HTTP response.
    Promise.resolve()
      .then(async () => {
        if (!projectId || !UUID_RE.test(projectId)) return;
        const project = await Project.findByPk(projectId);
        if (!project || !project.builder_id) {
          // Usually means the projects seeder never ran against this DB, so the
          // UUID the client read from GET /projects has no row behind it.
          console.warn('[QUOTE SOCKET] no project row for id', projectId, '— notification skipped');
          return;
        }
        // builder_id linkage is the control; role check is belt-and-braces.
        const builder = await User.findOne({
          where: { id: project.builder_id, role: 'builder' },
        });
        if (!builder) return;
        req.app.get('io')?.to(`user:${builder.id}`).emit('quote_request', {
          quoteId:     quote.id,
          projectName: project.name,
          userName,
          createdAt:   payload.createdAt,
        });
      })
      .catch(err => console.error('[QUOTE SOCKET ERROR]', err.message));

    return res.status(201).json({
      success: true,
      data: { id: quote.id, viewLink: `${FRONTEND_URL}/quote/${quote.id}` },
    });
  } catch (err) {
    next(err);
  }
}

async function listQuotes(req, res, next) {
  try {
    const requesterEmail = lower(req.query.email);
    const projectEmail   = lower(req.query.projectEmail);
    if (!requesterEmail && !projectEmail) {
      return res.status(400).json({ success: false, error: { message: 'email or projectEmail query parameter is required.' } });
    }

    // email → quotes this user requested (investor side), matching either the
    // reply-to address they typed or the account they were signed in as;
    // projectEmail → quotes against a builder's projects (builder side).
    const where = requesterEmail
      ? { [Op.or]: [
          Quote.sequelize.where(Quote.sequelize.fn('lower', Quote.sequelize.col('user_email')), requesterEmail),
          Quote.sequelize.where(Quote.sequelize.fn('lower', Quote.sequelize.col('account_email')), requesterEmail),
        ] }
      : Quote.sequelize.where(Quote.sequelize.fn('lower', Quote.sequelize.col('project_email')), projectEmail);

    const quotes = await Quote.findAll({ where, order: [['created_at', 'DESC']] });
    return res.json({ success: true, data: quotes.map((q) => q.toSafeJSON()) });
  } catch (err) {
    next(err);
  }
}

async function getQuote(req, res, next) {
  try {
    const quote = await Quote.findByPk(req.params.id);
    if (!quote) {
      return res.status(404).json({ success: false, error: { message: 'Quote not found.' } });
    }
    return res.json({ success: true, data: quote.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function getQuoteByToken(req, res, next) {
  try {
    const quote = await Quote.findOne({ where: { response_token: req.params.token } });
    if (!quote) {
      return res.status(404).json({ success: false, error: { message: 'Invalid or expired response token.' } });
    }
    return res.json({ success: true, data: quote.toSafeJSON() });
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

    // Conditional UPDATE: two builders racing the same link can't both win, and
    // the previous read-then-write "already responded" check can't interleave.
    const [updated] = await Quote.update(
      {
        builder_response:    builderResponse.trim(),
        builder_quote_price: builderQuotePrice?.trim() || null,
        builder_timeline:    builderTimeline?.trim() || null,
        status:              'responded',
        responded_at:        new Date(),
      },
      { where: { response_token: token, status: 'pending' } }
    );

    if (updated === 0) {
      // Either the token is unknown or the quote was already answered.
      const exists = await Quote.findOne({ where: { response_token: token } });
      return exists
        ? res.status(400).json({ success: false, error: { message: 'This quote has already been responded to.' } })
        : res.status(404).json({ success: false, error: { message: 'Invalid or expired response token.' } });
    }

    const quote    = await Quote.findOne({ where: { response_token: token } });
    const viewLink = `${FRONTEND_URL}/quote/${quote.id}`;
    emailService.sendQuoteReadyToUser({ quote: quote.toEmailPayload(), viewLink })
      .catch(err => console.error('[EMAIL ERROR]', err.message));

    return res.json({ success: true, data: { viewLink } });
  } catch (err) {
    next(err);
  }
}

/** Total quote count — admin dashboard stat. */
async function countQuotes() {
  return Quote.count();
}

/**
 * Remove every quote request tied to a user's email (called on account deletion
 * so the requester's PII doesn't linger). Matches by email since quotes have no
 * user FK — a quote can be submitted by someone who never held an account.
 */
async function purgeQuotesByEmail(emailRaw) {
  const e = lower(emailRaw);
  if (!e) return 0;
  return Quote.destroy({
    where: {
      [Op.or]: [
        Quote.sequelize.where(Quote.sequelize.fn('lower', Quote.sequelize.col('user_email')), e),
        Quote.sequelize.where(Quote.sequelize.fn('lower', Quote.sequelize.col('account_email')), e),
      ],
    },
  });
}

async function deleteQuote(req, res, next) {
  try {
    const { id } = req.params;
    const requesterEmail = lower(req.query.email);

    const quote = await Quote.findByPk(id);
    if (!quote) {
      return res.status(404).json({ success: false, error: { message: 'Quote not found.' } });
    }

    // Email-gated like listQuotes: only the requester may delete their own quote.
    // ponytail: email match, not real auth — same ceiling as the rest of the public
    // quote API. Swap for authenticate + req.user.id if quotes move behind login.
    const owns = requesterEmail
      && (lower(quote.user_email) === requesterEmail || lower(quote.account_email) === requesterEmail);
    if (!owns) {
      return res.status(403).json({ success: false, error: { message: 'You can only delete your own quote requests.' } });
    }

    const payload = quote.toEmailPayload();
    await quote.destroy(); // hard delete — the row and its reference ID are gone for good

    // Best-effort cancellation notice — wrapped so a failing send can never turn
    // a successful delete into a 500.
    Promise.resolve()
      .then(() => emailService.sendQuoteDeletedToUser({ quote: payload }))
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

    emailService.sendSiteVisitRequest({
      projectName, projectEmail,
      visitorName, visitorEmail, visitorPhone,
      preferredDate, preferredTime, notes,
    }).catch(err => console.error('[EMAIL ERROR]', err.message));

    return res.status(201).json({ success: true, data: { message: 'Site visit request submitted.' } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createQuote, listQuotes, getQuote, getQuoteByToken, submitBuilderResponse,
  deleteQuote, scheduleSiteVisit, purgeQuotesByEmail, countQuotes,
};
