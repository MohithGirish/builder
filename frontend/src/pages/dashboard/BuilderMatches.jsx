/*
 * BuilderMatches.jsx — Project matches page for the investor dashboard.
 *
 * Surfaces the onboarded real projects (PROJECT_MATCHES) as the investor's
 * automatic AI matches: a filterable list by category (Residential, Commercial,
 * Villa) with stat summary chips, match scores, location, developer, price
 * range, and highlight tags. Each card links to the project detail page.
 * Accessible at /investor-dashboard/matches.
 */
import { useState } from 'react';
import {
  ArrowLeft, MapPin, Star,
  Building2, BarChart3, BadgeCheck, Wallet, Sparkles, Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PROJECT_MATCHES } from '../../data/realProjects';

const TABS = [
  { id: 'all',         label: 'All Projects' },
  { id: 'residential', label: 'Residential'  },
  { id: 'commercial',  label: 'Commercial'   },
  { id: 'villa',       label: 'Villa'        },
];

const avg = (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

const STAT_CHIPS = [
  { label: 'Total Matches',   value: PROJECT_MATCHES.length || '—',                                              icon: Building2 },
  { label: 'Avg Match Score', value: PROJECT_MATCHES.length ? avg(PROJECT_MATCHES.map(p => p.matchScore)) + '%' : '—', icon: BarChart3 },
  { label: 'RERA Approved',   value: PROJECT_MATCHES.filter(p => /^TS ?RERA/i.test(p.rera)).length || '—',        icon: BadgeCheck },
  { label: 'Locations',       value: new Set(PROJECT_MATCHES.map(p => p.location.split(',')[0])).size || '—',     icon: Wallet },
];

function ProjectMatchCard({ project }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow duration-300">
      <div className="flex items-start gap-4">
        {/* Project badge */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: project.color }}
        >
          {project.name.slice(0, 2).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{project.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{project.developer} · {project.type}</p>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold text-white bg-brand-gradient">
              {project.matchScore}% Match
            </span>
          </div>

          {/* Location */}
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <MapPin size={11} /> {project.location}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="tag-teal text-[11px] capitalize">{project.category}</span>
            <span className="tag-teal text-[11px]">{project.status}</span>
          </div>

          {/* Price range */}
          <p className="text-xs text-slate-500 mt-2">
            Price Range:{' '}
            <span className="font-semibold text-slate-700">{project.priceRange}</span>
          </p>

          {/* Highlights */}
          <div className="mt-2">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">Project Highlights</p>
            <div className="flex flex-wrap gap-1.5">
              {project.highlights.slice(0, 3).map((h) => (
                <span key={h.label} className="tag-orange text-[11px]">{h.label}: {h.value}</span>
              ))}
            </div>
          </div>

          {/* Footer + CTA */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Star size={11} fill="#f59e0b" className="text-amber-400" /> RERA {project.rera}
            </span>
            <Link
              to={`/projects/${project.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors"
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
    ? PROJECT_MATCHES
    : PROJECT_MATCHES.filter((p) => p.category === activeTab);

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      {/* Back */}
      <Link to="/investor-dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 mb-4">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-brand-gradient">
            <Sparkles size={14} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Project Matches for You</h1>
        </div>
        <p className="text-sm text-slate-500">These onboarded projects match your investment criteria and risk profile.</p>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STAT_CHIPS.map((chip) => (
          <div key={chip.label} className="bg-white rounded-xl shadow-card px-4 py-3 flex items-center gap-2.5">
            <chip.icon size={18} className="text-brand-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-800">{chip.value}</p>
              <p className="text-[11px] text-slate-500">{chip.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap" role="tablist" aria-label="Filter by project type">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`cursor-pointer ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Search size={22} className="text-slate-300" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">No projects in this category</h3>
            <p className="text-sm text-slate-500 max-w-xs">Try a different category tab.</p>
          </div>
        ) : (
          filtered.map((p) => <ProjectMatchCard key={p.id} project={p} />)
        )}
      </div>
    </div>
  );
}
