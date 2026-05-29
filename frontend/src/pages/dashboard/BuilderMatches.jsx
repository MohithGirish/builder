/*
 * BuilderMatches.jsx — Investor leads page for the investor dashboard.
 *
 * Displays a filterable list of builder leads (BUILDER_LEADS) categorised by
 * project type (Residential, Commercial, Infrastructure) with stat summary
 * chips, sector tags, highlight tags, and match scores. Each card includes
 * a "View Project" CTA linking to the dealroom. Accessible at
 * /investor-dashboard/matches.
 */
import { useState } from 'react';
import { ArrowLeft, MapPin, CheckCircle2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BUILDER_LEADS } from '../../data/dashboard';

const TABS = [
  { id: 'all',            label: 'All Projects'  },
  { id: 'residential',   label: 'Residential'   },
  { id: 'commercial',    label: 'Commercial'     },
  { id: 'infrastructure',label: 'Infrastructure' },
];

const STAT_CHIPS = [
  { label: 'Total Leads',      value: '6',              icon: '👥' },
  { label: 'Avg Match Score',  value: '90%',            icon: '📊' },
  { label: 'Verified',         value: '6',              icon: '✅' },
  { label: 'Funding Range',    value: '₹50-1,000 Cr',  icon: '💰' },
];

function BuilderLeadCard({ builder }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow duration-300">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: builder.avatar_color }}
        >
          {builder.initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-800">{builder.company}</h3>
                {builder.is_verified && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}>
                    <CheckCircle2 size={8} /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Founder: {builder.name} · {builder.projects_done} Projects Completed
              </p>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}>
              {builder.match_score}% Match
            </span>
          </div>

          {/* Location */}
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <MapPin size={11} /> {builder.city}
          </p>

          {/* Sectors */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {builder.sectors.map((s) => <span key={s} className="tag-teal text-[11px]">{s}</span>)}
          </div>

          {/* Funding req */}
          <p className="text-xs text-slate-500 mt-2">
            Funding Required:{' '}
            <span className="font-semibold text-slate-700">₹{builder.funding_req} Cr</span>
          </p>

          {/* Project Highlights */}
          <div className="mt-2">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">Project Highlights</p>
            <div className="flex flex-wrap gap-1.5">
              {builder.highlight_tags.map((t) => <span key={t} className="tag-orange text-[11px]">{t}</span>)}
            </div>
          </div>

          {/* Stats + CTA */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Star size={11} fill="#f59e0b" className="text-amber-400" /> {builder.rating}
              </span>
              <span>Total: {builder.total_value}</span>
            </div>
            <Link
              to="/dealroom"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(to right,#f97316,#f59e0b)' }}
            >
              View Project
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BuilderMatches() {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all'
    ? BUILDER_LEADS
    : BUILDER_LEADS.filter((b) => b.category === activeTab);

  return (
    <div className="p-6 max-w-4xl">
      {/* Back */}
      <Link to="/investor-dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 mb-4">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,#0d9488,#14c38e)' }}>
            <span className="text-white text-xs">✦</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Builder Leads for You</h1>
        </div>
        <p className="text-sm text-slate-500">These builders match your investment criteria and risk profile.</p>
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

      {/* Tabs */}
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
            <p className="font-semibold text-slate-600">No builders in this category.</p>
          </div>
        ) : (
          filtered.map((b) => <BuilderLeadCard key={b.id} builder={b} />)
        )}
      </div>
    </div>
  );
}
