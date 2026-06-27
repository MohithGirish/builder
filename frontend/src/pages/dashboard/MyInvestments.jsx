/*
 * MyInvestments.jsx — Quote requests tracker for investor users.
 *
 * Fetches the signed-in user's quote requests from GET /api/v1/quotes?email=
 * and lists them with project name, status (pending / responded), requested
 * date, layout preferences, and — once the builder replies — the quoted price,
 * timeline, and response. Summary chips show total / pending / responded counts.
 * Accessible at /investor-dashboard/investments.
 */
import { ArrowLeft, FileText, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../lib/useApi';

const STATUS = {
  pending:   { label: 'Awaiting Response', color: 'bg-amber-100 text-amber-700', Icon: Clock },
  responded: { label: 'Quote Received',    color: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
};

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function QuoteCard({ quote }) {
  const st = STATUS[quote.status] || STATUS.pending;
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-800">{quote.projectName}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Requested {fmtDate(quote.createdAt)}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.color}`}>
          <st.Icon size={11} /> {st.label}
        </span>
      </div>

      {/* Layout preferences */}
      {quote.layoutPreferences?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {quote.layoutPreferences.map((p) => (
            <span key={p} className="tag-teal text-[11px]">{p}</span>
          ))}
        </div>
      )}

      {/* Requirements */}
      {quote.requirements && (
        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{quote.requirements}</p>
      )}

      {/* Builder response, once available */}
      {quote.status === 'responded' && (
        <div className="mt-3 rounded-xl bg-brand-50 border border-brand-100 p-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 mb-1">
            {quote.builderQuotePrice && (
              <span className="text-xs text-slate-600">Quote: <span className="font-semibold text-brand-700">{quote.builderQuotePrice}</span></span>
            )}
            {quote.builderTimeline && (
              <span className="text-xs text-slate-600">Timeline: <span className="font-semibold text-slate-700">{quote.builderTimeline}</span></span>
            )}
          </div>
          {quote.builderResponse && (
            <p className="text-xs text-slate-600 line-clamp-2">{quote.builderResponse}</p>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="mt-3 flex justify-end">
        <Link
          to={`/quote/${quote.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 transition-colors border border-brand-200 px-3 py-1.5 rounded-full hover:bg-brand-50"
        >
          View Quote <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

export default function MyInvestments() {
  const { user } = useAuth();
  const email = user?.email || '';
  const { data, loading, error } = useApi(
    email ? `/api/v1/quotes?email=${encodeURIComponent(email)}` : null,
    { ttl: 10000 },
  );
  const quotes = data?.data || [];

  const pending   = quotes.filter((q) => q.status === 'pending').length;
  const responded = quotes.filter((q) => q.status === 'responded').length;

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      {/* Back */}
      <Link to="/investor-dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 mb-4">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">My Quote Requests</h1>
        <p className="text-sm text-slate-500 mt-0.5">Quotes you've requested from builders</p>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-card px-4 py-3 text-center">
          <p className="text-lg font-extrabold text-brand-700">{quotes.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Requests</p>
        </div>
        <div className="bg-white rounded-xl shadow-card px-4 py-3 text-center">
          <p className="text-lg font-extrabold text-amber-500">{pending}</p>
          <p className="text-xs text-slate-400 mt-0.5">Awaiting</p>
        </div>
        <div className="bg-white rounded-xl shadow-card px-4 py-3 text-center">
          <p className="text-lg font-extrabold text-green-600">{responded}</p>
          <p className="text-xs text-slate-400 mt-0.5">Received</p>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading your quotes…</div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-card">
            <p className="font-semibold text-slate-600 mb-1">Couldn't load your quotes</p>
            <p className="text-slate-400 text-sm">{error}</p>
          </div>
        ) : quotes.length > 0 ? (
          quotes.map((q) => <QuoteCard key={q.id} quote={q} />)
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <FileText size={22} className="text-slate-400" />
            </div>
            <p className="font-semibold text-slate-600 mb-1">No Quote Requests Yet</p>
            <p className="text-slate-400 text-sm">Browse projects and request a quote to get started.</p>
            <Link to="/projects" className="inline-block mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700">
              Browse Projects →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
