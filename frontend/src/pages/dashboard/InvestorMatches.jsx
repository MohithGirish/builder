/*
 * InvestorMatches.jsx — Investor leads page for the builder dashboard.
 *
 * Displays a filterable list of investor leads (INVESTOR_LEADS) segmented
 * by type (VC Firms, PE Funds, Angel Investors) with summary stat chips,
 * sector tags, focus area tags, active deal counts, and match scores. Each
 * card includes a "Connect" CTA linking to the dealroom. Accessible at
 * /dashboard/matches.
 */
import { useState } from 'react';
import { ArrowLeft, MapPin, Briefcase, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  INVESTOR_LEADS, BUILDER_ANALYTICS_KPIS,
} from '../../data/dashboard';

const TABS = [
  { id: 'all',   label: 'All Matches' },
  { id: 'vc',    label: 'VC Firms'    },
  { id: 'pe',    label: 'PE Funds'    },
  { id: 'angel', label: 'Angel Investors' },
];

const STAT_CHIPS = [
  { label: 'Total Matches',      value: '6',           icon: '👥' },
  { label: 'Avg Match Score',    value: '90%',          icon: '📊' },
  { label: 'Verified',           value: '5',            icon: '✅' },
  { label: 'Investment Range',   value: '₹10-500 Cr',  icon: '💰' },
];

function InvestorLeadCard({ inv }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow duration-300">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: inv.avatar_color }}
        >
          {inv.initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-800">{inv.company}</h3>
                {inv.is_verified && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}>
                    <CheckCircle2 size={8} /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin size={10} /> {inv.type} · {inv.city}
              </p>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}>
              {inv.match_score}% Match
            </span>
          </div>

          {/* Investment Range */}
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <Briefcase size={11} /> Investment Range: <span className="font-semibold text-slate-700 ml-0.5">{inv.investment_range}</span>
          </p>

          {/* Sectors */}
          <div className="mt-2">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">Investment Sectors</p>
            <div className="flex flex-wrap gap-1.5">
              {inv.sectors.map((s) => <span key={s} className="tag-teal text-[11px]">{s}</span>)}
            </div>
          </div>

          {/* Focus Areas */}
          <div className="mt-2">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">Focus Areas</p>
            <div className="flex flex-wrap gap-1.5">
              {inv.focus_areas.map((f) => <span key={f} className="tag-gray text-[11px]">{f}</span>)}
            </div>
          </div>

          {/* Stats + CTA */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex gap-4 text-xs text-slate-500">
              <span>🤝 {inv.active_deals} Active Deals</span>
              <span>💼 {inv.portfolio}</span>
            </div>
            <Link
              to="/dealroom"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 border-brand-500 text-brand-700 hover:bg-brand-50 transition-colors"
            >
              Connect
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvestorMatches() {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all'
    ? INVESTOR_LEADS
    : INVESTOR_LEADS.filter((i) => i.category === activeTab);

  return (
    <div className="p-6 max-w-4xl">
      {/* Back */}
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 mb-4">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#0d9488,#14c38e)' }}>
              <span className="text-white text-xs">✦</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800">Your Investor Leads</h1>
          </div>
          <p className="text-sm text-slate-500">Based on your projects, these investors are the most relevant matches for you.</p>
        </div>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STAT_CHIPS.map((chip) => (
          <div key={chip.label} className="bg-white rounded-xl shadow-card px-4 py-3 flex items-center gap-2">
            <span className="text-lg">{chip.icon}</span>
            <div>
              <p className="text-sm font-bold text-slate-800">{chip.value}</p>
              <p className="text-[11px] text-slate-400">{chip.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'
            }`}
            style={activeTab === tab.id ? { background: 'linear-gradient(135deg,#0d9488,#14c38e)' } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-slate-600">No investors in this category.</p>
          </div>
        ) : (
          filtered.map((inv) => <InvestorLeadCard key={inv.id} inv={inv} />)
        )}
      </div>
    </div>
  );
}
