/*
 * QuoteResponsePage.jsx — Public page for builders to submit a quote response.
 *
 * Accessed via the secure token link embedded in the quote-request email sent
 * to the project developer. Loads the original request by token (GET
 * /api/v1/quotes/respond/:token), displays the customer's details and
 * requirements, then lets the builder fill in quoted price, timeline, and a
 * detailed response message. On submit (POST /api/v1/quotes/respond/:token)
 * the platform sends a "quote ready" email to the customer with a deep-link.
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import {
  Loader2, AlertCircle, CheckCircle2, FileText, User,
  Mail, Phone, Building2, DollarSign, Clock, Send
} from 'lucide-react';

export default function QuoteResponsePage() {
  const { token } = useParams();
  const [quote,   setQuote]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [done,    setDone]    = useState(false);

  const [price,    setPrice]    = useState('');
  const [timeline, setTimeline] = useState('');
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitErr,  setSubmitErr]  = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch(`/api/v1/quotes/respond/${token}`, {}, 'Invalid or expired link.');
        setQuote(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleSubmit() {
    if (!response.trim()) {
      setSubmitErr('Please provide a response message.');
      return;
    }
    setSubmitting(true);
    setSubmitErr('');
    try {
      await apiFetch(`/api/v1/quotes/respond/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          builderResponse:   response.trim(),
          builderQuotePrice: price.trim() || null,
          builderTimeline:   timeline.trim() || null,
        }),
      }, 'Submission failed.');
      setDone(true);
    } catch (err) {
      setSubmitErr(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={22} className="animate-spin text-teal-500" />
          <span className="text-sm font-medium">Loading request…</span>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Link Invalid or Expired</h2>
          <p className="text-slate-500 text-sm mb-4">{error || 'This response link is no longer valid.'}</p>
          <Link to="/" className="text-teal-600 hover:text-teal-700 text-sm font-semibold hover:underline">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Quote Submitted!</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your response has been sent to <strong>{quote.userName}</strong>.
            They will receive an email notification with a link to view your quote.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-500 rounded-2xl px-6 py-5 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={15} className="text-white/70" />
            <span className="text-white/70 text-xs font-semibold uppercase tracking-wide">BuilderAI Platform — Quote Response</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">{quote.projectName}</h1>
          <p className="text-white/70 text-sm mt-1">A customer has requested a quote for this project.</p>
        </div>

        {/* Request summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-5 mb-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <FileText size={14} className="text-teal-500" /> Customer Request
          </h2>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User size={13} className="text-slate-400" />
              <span className="font-semibold">{quote.userName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail size={13} className="text-slate-400" />
              <span className="truncate">{quote.userEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone size={13} className="text-slate-400" />
              <span>{quote.userPhone}</span>
            </div>
          </div>

          {quote.layoutPreferences?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Layout Preferences</p>
              <div className="flex flex-wrap gap-2">
                {quote.layoutPreferences.map(l => (
                  <span key={l} className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}

          {quote.requirements && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Requirements</p>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 whitespace-pre-wrap">
                {quote.requirements}
              </p>
            </div>
          )}
        </div>

        {/* Response form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-5">
          <h2 className="text-sm font-bold text-slate-700 mb-5 flex items-center gap-2">
            <Send size={14} className="text-teal-500" /> Your Quote Response
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="qr-price" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  <DollarSign size={11} className="inline mr-1" />Quoted Price (Optional)
                </label>
                <input
                  id="qr-price"
                  type="text"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="e.g. ₹1.2 Cr – ₹1.5 Cr"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-400 text-sm text-slate-800 placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="qr-timeline" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  <Clock size={11} className="inline mr-1" />Timeline (Optional)
                </label>
                <input
                  id="qr-timeline"
                  type="text"
                  value={timeline}
                  onChange={e => setTimeline(e.target.value)}
                  placeholder="e.g. Ready by Q2 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-400 text-sm text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="qr-response" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Response Message <span className="text-red-400">*</span>
              </label>
              <textarea
                id="qr-response"
                value={response}
                onChange={e => setResponse(e.target.value)}
                rows={7}
                placeholder="Provide a detailed response to the customer's requirements. Include pricing details, available units, special offers, next steps, or any other relevant information…"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-400 text-sm text-slate-800 placeholder-slate-400 resize-none leading-relaxed"
              />
            </div>

            {submitErr && (
              <div role="alert" className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm font-medium">{submitErr}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #2b5e93, #36699f)' }}
            >
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                : <><Send size={15} /> Submit Quote Response</>
              }
            </button>
            <p className="text-xs text-slate-500 text-center">
              The customer will be notified by email when you submit your response.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
