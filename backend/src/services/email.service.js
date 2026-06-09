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
    ? `<ul style="margin:8px 0;padding-left:20px;">${quote.layoutPreferences.map(l => `<li style="margin-bottom:4px;">${l}</li>`).join('')}</ul>`
    : '<p style="margin:4px 0;color:#64748b;">No specific layout selected.</p>';

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#0f766e,#14b8a6);padding:28px 24px;border-radius:12px 12px 0 0;">
      <h1 style="color:white;margin:0;font-size:22px;letter-spacing:-0.3px;">New Quote Request</h1>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Received via BuilderAI Platform</p>
    </div>
    <div style="background:#fff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;">
      <h2 style="color:#1e293b;font-size:17px;margin:0 0 20px;">Project: ${quote.projectName}</h2>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px;">
        <h3 style="color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 12px;">Customer Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:5px 0;color:#94a3b8;font-size:13px;width:120px;">Name</td><td style="padding:5px 0;color:#1e293b;font-size:13px;font-weight:600;">${quote.userName}</td></tr>
          <tr><td style="padding:5px 0;color:#94a3b8;font-size:13px;">Email</td><td style="padding:5px 0;color:#1e293b;font-size:13px;font-weight:600;">${quote.userEmail}</td></tr>
          <tr><td style="padding:5px 0;color:#94a3b8;font-size:13px;">Phone</td><td style="padding:5px 0;color:#1e293b;font-size:13px;font-weight:600;">${quote.userPhone}</td></tr>
        </table>
      </div>

      <h3 style="color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px;">Layout Preferences</h3>
      <div style="color:#1e293b;font-size:14px;margin-bottom:20px;">${layoutList}</div>

      <h3 style="color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px;">Requirements &amp; Specifications</h3>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;color:#334155;font-size:14px;line-height:1.7;margin-bottom:28px;white-space:pre-wrap;">${quote.requirements || 'No additional requirements specified.'}</div>

      <a href="${responseLink}" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#14b8a6);color:white;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:700;font-size:15px;">
        Submit Your Quote Response →
      </a>

      <p style="color:#94a3b8;font-size:12px;margin-top:24px;line-height:1.5;">
        The customer is awaiting your response. Click the button above to open the response form.
        Reference ID: <strong>${quote.id}</strong>
      </p>
    </div>
    <div style="background:#f8fafc;padding:14px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;text-align:center;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">BuilderAI Platform · Connecting Builders &amp; Investors</p>
    </div>
  </div>`;

  return sendEmail(quote.projectEmail, `New Quote Request: ${quote.projectName}`, html);
}

async function sendQuoteConfirmationToUser({ quote }) {
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#0f766e,#14b8a6);padding:28px 24px;border-radius:12px 12px 0 0;">
      <h1 style="color:white;margin:0;font-size:22px;">Quote Request Submitted</h1>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">BuilderAI Platform</p>
    </div>
    <div style="background:#fff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;">
      <p style="color:#1e293b;font-size:15px;font-weight:600;">Dear ${quote.userName},</p>
      <p style="color:#475569;font-size:14px;line-height:1.7;">
        Your quote request for <strong>${quote.projectName}</strong> has been submitted successfully.
        The developer has been notified and will review your requirements shortly.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin:20px 0;">
        <p style="color:#166534;font-size:13px;margin:0;">
          <strong>Reference ID:</strong> ${quote.id}
        </p>
      </div>
      <p style="color:#475569;font-size:14px;line-height:1.7;">
        You will receive an email notification as soon as the developer submits your quote.
        You can use the reference ID above to track your request.
      </p>
    </div>
    <div style="background:#f8fafc;padding:14px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;text-align:center;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">BuilderAI Platform · Connecting Builders &amp; Investors</p>
    </div>
  </div>`;

  return sendEmail(quote.userEmail, `Quote Request Confirmed – ${quote.projectName}`, html);
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
  sendQuoteReadyToUser,
  sendSiteVisitRequest,
};
