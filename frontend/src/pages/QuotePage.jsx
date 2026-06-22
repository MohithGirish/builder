/*
 * QuotePage.jsx — Public page displaying a submitted quote request and its response.
 *
 * Fetches a quote by ID from GET /api/v1/quotes/:id. Shows the original request
 * details (project, contact, layout preferences, requirements) and, once the
 * builder responds, displays the builder's quote price, timeline, and response.
 * Includes a pending state while the developer has not yet responded. Accessible
 * via the deep-link sent in the "quote ready" email notification.
 */
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../lib/useApi';
import {
  CheckCircle2, Clock, FileText, Phone, Mail, User,
  Building2, ArrowLeft, Loader2, AlertCircle, Calendar, DollarSign
} from 'lucide-react';

function StatusBadge({ status }) {
  if (status === 'responded') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
        <CheckCircle2 size={12} /> Quote Ready
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
      <Clock size={12} /> Pending Review
    </span>
  );
}

export default function QuotePage() {
  const { id } = useParams();
  // Cached GET — a short TTL is fine (quote status changes only when the
  // builder responds); revisiting the page won't refetch within the window.
  const { data, loading, error } = useApi(`/api/v1/quotes/${id}`, { ttl: 15000 });
  const quote = data?.data;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={22} className="animate-spin text-teal-500" />
          <span className="text-sm font-medium">Loading quote…</span>
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
          <h2 className="text-xl font-bold text-slate-800 mb-1">Quote Not Found</h2>
          <p className="text-slate-500 text-sm mb-4">{error || 'This quote link may be invalid or expired.'}</p>
          <Link to="/" className="text-teal-600 hover:text-teal-700 text-sm font-semibold hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-5">
          <div className="bg-gradient-to-r from-teal-700 to-teal-500 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={15} className="text-white/70" />
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-wide">Quote Request</span>
                </div>
                <h1 className="text-xl font-extrabold text-white leading-tight">{quote.projectName}</h1>
                <p className="text-white/60 text-xs mt-1 font-mono">{quote.id}</p>
              </div>
              <StatusBadge status={quote.status} />
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Contact info */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Details</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <User size={13} className="text-slate-400 shrink-0" />
                  <span className="font-semibold truncate">{quote.userName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{quote.userEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>{quote.userPhone}</span>
                </div>
              </div>
            </div>

            {/* Layout preferences */}
            {quote.layoutPreferences?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Layout Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {quote.layoutPreferences.map(l => (
                    <span key={l} className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {quote.requirements && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Requirements</h3>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 whitespace-pre-wrap">
                  {quote.requirements}
                </p>
              </div>
            )}

            {/* Submitted date */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar size={12} />
              Submitted {new Date(quote.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Builder response */}
        {quote.status === 'responded' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
            <div className="bg-green-50 border-b border-green-100 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-green-800">Developer's Quote</h2>
                <p className="text-xs text-green-600">
                  Responded {new Date(quote.respondedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              {quote.builderQuotePrice && (
                <div className="flex items-start gap-3 bg-teal-50 rounded-xl px-4 py-3">
                  <DollarSign size={16} className="text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-0.5">Quoted Price</p>
                    <p className="text-lg font-extrabold text-teal-800">{quote.builderQuotePrice}</p>
                  </div>
                </div>
              )}

              {quote.builderTimeline && (
                <div className="flex items-start gap-3 bg-slate-50 rounded-xl px-4 py-3">
                  <Clock size={16} className="text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-0.5">Timeline</p>
                    <p className="text-sm font-bold text-slate-700">{quote.builderTimeline}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Developer's Response</h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl px-4 py-3">
                  {quote.builderResponse}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to={`/projects/${quote.projectId}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 hover:underline"
                >
                  <Building2 size={14} /> View Project Details
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 px-6 py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <Clock size={24} className="text-amber-500" />
            </div>
            <h2 className="text-base font-bold text-slate-800 mb-2">Awaiting Developer Response</h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
              Your request has been sent to the developer. You'll receive an email notification at{' '}
              <strong>{quote.userEmail}</strong> as soon as they submit a quote.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                to={`/projects/${quote.projectId}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                <Building2 size={14} /> View Project
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
