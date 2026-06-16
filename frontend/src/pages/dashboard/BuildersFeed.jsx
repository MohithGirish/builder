/*
 * BuildersFeed.jsx — Browsable feed of builders for investor users.
 *
 * Renders a search-filtered grid of builder cards. Each card uses clean
 * anatomy (no cover image): teal-gradient avatar, name, company, rating,
 * location, stats row (projects + portfolio value), sector tags, and a
 * "View Profile" CTA. Empty state shows a centered icon + message.
 * Accessible at /investor-dashboard/feed.
 */
import { useState } from 'react';
import { CheckCircle2, MapPin, Star, Briefcase, TrendingUp, ArrowLeft, Search, Users, ArrowRight } from 'lucide-react';
import { BUILDERS } from '../../data/builders';
import { Link } from 'react-router-dom';

function FeedBuilderCard({ builder }) {
  const initials = (builder.name || builder.company || '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-card flex flex-col h-full transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">

      {/* Top row: avatar + verified badge */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold text-white bg-brand-gradient shadow-sm shrink-0">
          {initials}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {builder.verified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold text-white bg-brand-gradient shrink-0">
              <CheckCircle2 size={9} /> Verified
            </span>
          )}
          <div className="flex items-center gap-0.5 text-xs font-semibold text-amber-500">
            <Star size={11} fill="currentColor" /> {builder.rating}
          </div>
        </div>
      </div>

      {/* Name + company + location */}
      <div className="px-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900 leading-snug">{builder.name}</h3>
        <p className="text-sm text-slate-500 mt-0.5 truncate">{builder.company}</p>
        {builder.location && (
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 truncate">
            <MapPin size={10} className="text-teal-500 shrink-0" /> {builder.location}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 mx-5" />

      {/* Stats row */}
      <div className="grid grid-cols-2 px-5 py-3 gap-x-4">
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide flex items-center gap-1 mb-0.5">
            <Briefcase size={11} /> Projects
          </p>
          <p className="text-sm font-semibold text-slate-800">{builder.projects}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide flex items-center gap-1 mb-0.5">
            <TrendingUp size={11} /> Total Value
          </p>
          <p className="text-sm font-semibold text-teal-700">{builder.totalValue}</p>
        </div>
      </div>

      {/* Sector tags */}
      <div className="flex flex-wrap gap-1.5 px-5 pb-4 flex-1">
        {builder.sectors.slice(0, 3).map((s) => (
          <span
            key={s}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border border-slate-200 text-slate-600 bg-white"
          >
            {s}
          </span>
        ))}
        {builder.sectors.length > 3 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
            +{builder.sectors.length - 3}
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 mt-auto">
        <Link
          to="/investor-dashboard/matches"
          aria-label={`View profile of ${builder.name}`}
          className="btn-brand w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
        >
          View Profile <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

export default function BuildersFeed() {
  const [search, setSearch] = useState('');

  const filtered = BUILDERS.filter((b) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return b.name.toLowerCase().includes(s) || b.company.toLowerCase().includes(s) || b.location.toLowerCase().includes(s);
  });

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      <Link to="/investor-dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-800 mb-4">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Builders Feed</h1>
          <p className="text-sm text-slate-500 mt-0.5">Browse verified builders matching your investment profile</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative w-full max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search builders, companies, locations..."
            aria-label="Search builders"
            className="w-full pl-9 pr-4 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-colors bg-white shadow-card"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((b) => (
            <FeedBuilderCard key={b.id} builder={b} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-slate-300" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">
            {BUILDERS.length === 0 ? 'No builders available' : 'No builders match your search'}
          </h3>
          <p className="text-sm text-slate-500 max-w-xs">
            {BUILDERS.length === 0
              ? 'Verified builders will appear here once they register.'
              : 'Try a different search term.'}
          </p>
        </div>
      )}
    </div>
  );
}
