/*
 * BuilderQuotes.jsx — Incoming quote requests for builder users.
 *
 * Fetches the quote requests raised against the builder's projects from
 * GET /api/v1/quotes?projectEmail= and lists each requester with their name,
 * email, phone, the project requested, layout preferences, requirements, date,
 * and status. Summary chips show total / pending / responded counts.
 * Accessible at /dashboard/quote-requests.
 */
import { ArrowLeft, Mail, Phone, Clock, CheckCircle2, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../lib/useApi';
import { EINFRA_PROJECT_EMAIL, isEinfraBuilder } from '../../data/realProjects';

const STATUS = {
  pending:   { label: 'New Request',   color: 'bg-amber-100 text-amber-700', Icon: Clock },
  responded: { label: 'Responded',     color: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
};

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
}

function RequestCard({ quote }) {
  const st = STATUS[quote.status] || STATUS.pending;
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow duration-300">
      <div className="flex items-start gap-4">
        {/* Requester avatar */}
        <div className="w-11 h-11 rounded-full bg-brand-gradient flex items-center justify-center text-sm font-bold text-white shrink-0">
          {initials(quote.userName)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{quote.userName}</h3>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <Building2 size={11} /> {quote.projectName}
              </p>
            </div>
            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.color}`}>
              <st.Icon size={11} /> {st.label}
            </span>
          </div>

          {/* Contact */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <a href={`mailto:${quote.userEmail}`} className="text-xs text-slate-600 hover:text-brand-700 flex items-center gap-1">
              <Mail size={11} /> {quote.userEmail}
            </a>
            <a href={`tel:${quote.userPhone}`} className="text-xs text-slate-600 hover:text-brand-700 flex items-center gap-1">
              <Phone size={11} /> {quote.userPhone}
            </a>
          </div>

          {/* Layout preferences */}
          {quote.layoutPreferences?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quote.layoutPreferences.map((p) => (
                <span key={p} className="tag-teal text-[11px]">{p}</span>
              ))}
            </div>
          )}

          {/* Requirements */}
          {quote.requirements && (
            <p className="text-xs text-slate-500 mt-2">{quote.requirements}</p>
          )}

          <p className="text-[11px] text-slate-400 mt-2">Requested {fmtDate(quote.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}

export default function BuilderQuotes() {
  const { user } = useAuth();
  const projectEmail = isEinfraBuilder(user) ? EINFRA_PROJECT_EMAIL : user?.email;
  const { data, loading, error } = useApi(
    projectEmail ? `/api/v1/quotes?projectEmail=${encodeURIComponent(projectEmail)}` : null,
    { ttl: 10000 },
  );
  const quotes = data?.data || [];

  const pending   = quotes.filter((q) => q.status === 'pending').length;
  const responded = quotes.filter((q) => q.status === 'responded').length;

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      {/* Back */}
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 mb-4">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Quote Requests</h1>
        <p className="text-sm text-slate-500 mt-0.5">People who have requested quotes for your projects</p>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-card px-4 py-3 text-center">
          <p className="text-lg font-extrabold text-brand-700">{quotes.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Requests</p>
        </div>
        <div className="bg-white rounded-xl shadow-card px-4 py-3 text-center">
          <p className="text-lg font-extrabold text-amber-500">{pending}</p>
          <p className="text-xs text-slate-400 mt-0.5">New</p>
        </div>
        <div className="bg-white rounded-xl shadow-card px-4 py-3 text-center">
          <p className="text-lg font-extrabold text-green-600">{responded}</p>
          <p className="text-xs text-slate-400 mt-0.5">Responded</p>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading quote requests…</div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-card">
            <p className="font-semibold text-slate-600 mb-1">Couldn't load requests</p>
            <p className="text-slate-400 text-sm">{error}</p>
          </div>
        ) : quotes.length > 0 ? (
          quotes.map((q) => <RequestCard key={q.id} quote={q} />)
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Mail size={22} className="text-slate-400" />
            </div>
            <p className="font-semibold text-slate-600 mb-1">No Quote Requests Yet</p>
            <p className="text-slate-400 text-sm">When investors request a quote for your projects, they'll appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
