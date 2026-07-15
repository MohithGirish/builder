/*
 * email.service.js — Email delivery service for the Builder AI backend.
 *
 * Wraps a Nodemailer transporter and exposes three send helpers: quote
 * request to the builder, submission confirmation to the requesting user,
 * and "your quote is ready" notification to the user with an embedded
 * deep-link. Falls back to console logging when no SMTP credentials are
 * configured so the rest of the flow still works in development.
 */
'use strict';

const nodemailer = require('nodemailer');

const EMAIL_USER  = process.env.EMAIL_USER;
const EMAIL_PASS  = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Blueprint Index palette (design-system/MASTER.md) — steel + ink navy + brass.
const C = {
  ink:    '#0e1b2e', // dark surface
  steel:  '#2b5e93', // brand-600
  deep:   '#234c78', // brand-700
  tint:   '#eef3f9', // brand-50
  tintBd: '#d8e3f1', // brand-100
  brass:  '#c2954a', // accent
  ink2:   '#1e293b', // body text (slate-800)
  body:   '#475569', // secondary text (slate-600)
  muted:  '#94a3b8',
  surf:   '#f5f7f9', // slate-50
};
const MONO = "'JetBrains Mono','SF Mono',Menlo,Consolas,monospace";

// Escape user-supplied values before they land in the HTML email body.
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function createTransporter() {
  if (!EMAIL_USER || !EMAIL_PASS || EMAIL_PASS === 'your_gmail_app_password_here') return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

async function sendEmail(to, subject, html) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('\n[EMAIL — dev mode, no SMTP configured]');
    console.log(`  To:      ${to}`);
    console.log(`  Subject: ${subject}\n`);
    return { mocked: true };
  }
  return transporter.sendMail({
    from: `"BuilderAI Platform" <${EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

async function sendQuoteRequestToBuilder({ quote, responseLink }) {
  const layoutList = quote.layoutPreferences?.length
    ? `<ul style="margin:8px 0;padding-left:20px;">${quote.layoutPreferences.map(l => `<li style="margin-bottom:4px;">${esc(l)}</li>`).join('')}</ul>`
    : '<p style="margin:4px 0;color:#64748b;">No specific layout selected.</p>';

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#0f766e,#14b8a6);padding:28px 24px;border-radius:12px 12px 0 0;">
      <h1 style="color:white;margin:0;font-size:22px;letter-spacing:-0.3px;">New Quote Request</h1>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Received via BuilderAI Platform</p>
    </div>
    <div style="background:#fff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;">
      <h2 style="color:#1e293b;font-size:17px;margin:0 0 20px;">Project: ${esc(quote.projectName)}</h2>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px;">
        <h3 style="color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 12px;">Customer Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:5px 0;color:#94a3b8;font-size:13px;width:120px;">Name</td><td style="padding:5px 0;color:#1e293b;font-size:13px;font-weight:600;">${esc(quote.userName)}</td></tr>
          <tr><td style="padding:5px 0;color:#94a3b8;font-size:13px;">Email</td><td style="padding:5px 0;color:#1e293b;font-size:13px;font-weight:600;">${esc(quote.userEmail)}</td></tr>
          <tr><td style="padding:5px 0;color:#94a3b8;font-size:13px;">Phone</td><td style="padding:5px 0;color:#1e293b;font-size:13px;font-weight:600;">${esc(quote.userPhone)}</td></tr>
        </table>
      </div>

      <h3 style="color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px;">Layout Preferences</h3>
      <div style="color:#1e293b;font-size:14px;margin-bottom:20px;">${layoutList}</div>

      <h3 style="color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px;">Requirements &amp; Specifications</h3>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;color:#334155;font-size:14px;line-height:1.7;margin-bottom:28px;white-space:pre-wrap;">${quote.requirements ? esc(quote.requirements) : 'No additional requirements specified.'}</div>

      <a href="${responseLink}" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#14b8a6);color:white;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:700;font-size:15px;">
        Submit Your Quote Response →
      </a>

      <p style="color:#94a3b8;font-size:12px;margin-top:24px;line-height:1.5;">
        The customer is awaiting your response. Click the button above to open the response form.
        Reference ID: <strong>${esc(quote.id)}</strong>
      </p>
    </div>
    <div style="background:#f8fafc;padding:14px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;text-align:center;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">BuilderAI Platform · Connecting Builders &amp; Investors</p>
    </div>
  </div>`;

  return sendEmail(quote.projectEmail, `New Quote Request: ${quote.projectName}`, html);
}

// Shared "what was requested" block — layout prefs, requirements, reference ID —
// so the deletion notice can echo the exact body of the original confirmation.
function quoteDetailsHtml(quote) {
  const prefs = quote.layoutPreferences?.length
    ? quote.layoutPreferences.map((p) =>
        `<span style="display:inline-block;background:${C.tint};color:${C.deep};border:1px solid ${C.tintBd};border-radius:999px;padding:6px 13px;font-size:12px;font-weight:600;margin:0 6px 8px 0;">${esc(p)}</span>`,
      ).join('')
    : `<span style="color:${C.muted};font-size:13px;">No specific layout was selected.</span>`;

  const req = quote.requirements?.trim()
    ? `<h3 style="color:${C.deep};font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin:22px 0 8px;">Requirements</h3>
       <div style="background:${C.surf};border:1px solid ${C.tintBd};border-radius:10px;padding:14px 16px;color:${C.ink2};font-size:14px;line-height:1.7;white-space:pre-wrap;">${esc(quote.requirements)}</div>`
    : '';

  return `
    <h3 style="color:${C.deep};font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin:24px 0 10px;">Layout Preferences Selected</h3>
    <div>${prefs}</div>
    ${req}
    <div style="background:${C.tint};border:1px solid ${C.tintBd};border-left:3px solid ${C.steel};border-radius:10px;padding:14px 16px;margin:24px 0;">
      <p style="color:${C.body};font-size:11px;text-transform:uppercase;letter-spacing:0.07em;margin:0 0 4px;">Reference ID</p>
      <p style="color:${C.deep};font-size:14px;font-weight:600;font-family:${MONO};margin:0;word-break:break-all;">${esc(quote.id)}</p>
    </div>`;
}

async function sendQuoteConfirmationToUser({ quote }) {
  const html = `
  <div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid ${C.tintBd};border-radius:14px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,${C.ink},${C.steel});padding:26px 28px;border-radius:14px 14px 0 0;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.02em;">Quote Request Submitted</h1>
      <div style="width:34px;height:3px;background:${C.brass};border-radius:2px;margin:10px 0 8px;"></div>
      <p style="color:rgba(255,255,255,0.72);margin:0;font-size:12px;letter-spacing:0.04em;">BUILDERAI PLATFORM</p>
    </div>

    <div style="padding:26px 28px;">
      <p style="color:${C.ink2};font-size:15px;font-weight:600;margin:0 0 10px;">Dear ${esc(quote.userName)},</p>
      <p style="color:${C.body};font-size:14px;line-height:1.7;margin:0 0 4px;">
        Your quote request for <strong style="color:${C.ink2};">${esc(quote.projectName)}</strong> has been submitted
        successfully. The developer has been notified and will review your requirements shortly.
      </p>

      ${quoteDetailsHtml(quote)}

      <p style="color:${C.body};font-size:14px;line-height:1.7;margin:0;">
        You'll receive another email the moment the developer submits your quote.
        Keep the reference ID above to track this request.
      </p>
    </div>

    <div style="background:${C.surf};padding:16px 28px;border-top:1px solid ${C.tintBd};text-align:center;">
      <p style="color:${C.muted};font-size:11px;margin:0;letter-spacing:0.02em;">BuilderAI Platform · Connecting Builders &amp; Investors</p>
    </div>
  </div>`;

  return sendEmail(quote.userEmail, `Quote Request Confirmed – ${quote.projectName}`, html);
}

async function sendQuoteDeletedToUser({ quote }) {
  const html = `
  <div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid ${C.tintBd};border-radius:14px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,${C.ink},${C.steel});padding:26px 28px;border-radius:14px 14px 0 0;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.02em;">Quote Request Deleted</h1>
      <div style="width:34px;height:3px;background:${C.brass};border-radius:2px;margin:10px 0 8px;"></div>
      <p style="color:rgba(255,255,255,0.72);margin:0;font-size:12px;letter-spacing:0.04em;">BUILDERAI PLATFORM</p>
    </div>

    <div style="padding:26px 28px;">
      <p style="color:${C.ink2};font-size:15px;font-weight:600;margin:0 0 10px;">Dear ${esc(quote.userName)},</p>
      <p style="color:${C.body};font-size:14px;line-height:1.7;margin:0 0 4px;">
        Your quote request for <strong style="color:${C.ink2};">${esc(quote.projectName)}</strong> has been deleted at
        your request and is no longer active. The developer will not respond to it.
      </p>

      <div style="background:#fef2f2;border:1px solid #fecaca;border-left:3px solid #dc2626;border-radius:10px;padding:12px 16px;margin:18px 0 0;">
        <p style="color:#b91c1c;font-size:13px;margin:0;line-height:1.6;">This request has been removed. The details below are kept for your records only.</p>
      </div>

      ${quoteDetailsHtml(quote)}

      <p style="color:${C.body};font-size:14px;line-height:1.7;margin:0;">
        Changed your mind? You can submit a fresh quote request anytime from the project page.
      </p>
    </div>

    <div style="background:${C.surf};padding:16px 28px;border-top:1px solid ${C.tintBd};text-align:center;">
      <p style="color:${C.muted};font-size:11px;margin:0;letter-spacing:0.02em;">BuilderAI Platform · Connecting Builders &amp; Investors</p>
    </div>
  </div>`;

  return sendEmail(quote.userEmail, `Quote Request Deleted – ${quote.projectName}`, html);
}

async function sendQuoteReadyToUser({ quote, viewLink }) {
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#0f766e,#14b8a6);padding:28px 24px;border-radius:12px 12px 0 0;">
      <h1 style="color:white;margin:0;font-size:22px;">Your Quote is Ready!</h1>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">BuilderAI Platform</p>
    </div>
    <div style="background:#fff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;">
      <p style="color:#1e293b;font-size:15px;font-weight:600;">Dear ${quote.userName},</p>
      <p style="color:#475569;font-size:14px;line-height:1.7;">
        Great news! The developer of <strong>${quote.projectName}</strong> has reviewed your request
        and submitted a quote for you.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${viewLink}" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#14b8a6);color:white;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:16px;">
          View Your Quote →
        </a>
      </div>
      <p style="color:#94a3b8;font-size:12px;text-align:center;">
        Or copy this link:<br>
        <a href="${viewLink}" style="color:#0d9488;word-break:break-all;">${viewLink}</a>
      </p>
    </div>
    <div style="background:#f8fafc;padding:14px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;text-align:center;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">BuilderAI Platform · Connecting Builders &amp; Investors</p>
    </div>
  </div>`;

  return sendEmail(quote.userEmail, `Your Quote is Ready – ${quote.projectName}`, html);
}

async function sendSiteVisitRequest({ projectName, projectEmail, visitorName, visitorEmail, visitorPhone, preferredDate, preferredTime, notes }) {
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#0f766e,#14b8a6);padding:28px 24px;border-radius:12px 12px 0 0;">
      <h1 style="color:white;margin:0;font-size:22px;">Site Visit Request</h1>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Received via BuilderAI Platform</p>
    </div>
    <div style="background:#fff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;">
      <h2 style="color:#1e293b;font-size:17px;margin:0 0 20px;">Project: ${projectName}</h2>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px;">
        <h3 style="color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 12px;">Visitor Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:5px 0;color:#94a3b8;font-size:13px;width:140px;">Name</td><td style="padding:5px 0;color:#1e293b;font-size:13px;font-weight:600;">${visitorName}</td></tr>
          <tr><td style="padding:5px 0;color:#94a3b8;font-size:13px;">Email</td><td style="padding:5px 0;color:#1e293b;font-size:13px;font-weight:600;">${visitorEmail}</td></tr>
          <tr><td style="padding:5px 0;color:#94a3b8;font-size:13px;">Phone</td><td style="padding:5px 0;color:#1e293b;font-size:13px;font-weight:600;">${visitorPhone}</td></tr>
          <tr><td style="padding:5px 0;color:#94a3b8;font-size:13px;">Preferred Date</td><td style="padding:5px 0;color:#1e293b;font-size:13px;font-weight:600;">${preferredDate}</td></tr>
          <tr><td style="padding:5px 0;color:#94a3b8;font-size:13px;">Preferred Time</td><td style="padding:5px 0;color:#1e293b;font-size:13px;font-weight:600;">${preferredTime}</td></tr>
        </table>
      </div>
      ${notes ? `<h3 style="color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px;">Additional Notes</h3>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;color:#334155;font-size:14px;line-height:1.7;">${notes}</div>` : ''}
    </div>
    <div style="background:#f8fafc;padding:14px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;text-align:center;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">BuilderAI Platform · Connecting Builders &amp; Investors</p>
    </div>
  </div>`;

  return sendEmail(projectEmail, `Site Visit Request: ${projectName}`, html);
}

module.exports = {
  sendQuoteRequestToBuilder,
  sendQuoteConfirmationToUser,
  sendQuoteDeletedToUser,
  sendQuoteReadyToUser,
  sendSiteVisitRequest,
};
