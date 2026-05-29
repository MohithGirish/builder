/*
 * BuildersFeed.jsx — Browsable feed of builders for investor users.
 *
 * Renders a search-filtered grid of builder cards drawn from the BUILDERS
 * dataset. Each card shows the builder's cover image, name, company, rating,
 * location, project count, total portfolio value, and sector tags. A "View
 * Profile" link leads to the dealroom. Accessible at
 * /investor-dashboard/feed.
 */
import { useState } from 'react';
import { CheckCircle2, MapPin, Star, Briefcase, TrendingUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BUILDERS } from '../../data/builders';

function FeedBuilderCard({ builder }) {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300">
      <div className="relative h-40">
        <img src={builder.imageUrl} alt={builder.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {builder.verified && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}>
            <CheckCircle2 size={9} /> Verified
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
               style={{ background: 'linear-gradient(135deg,#0d9488,#14c38e)' }}>
            {builder.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{builder.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{builder.company}</p>
          </div>
          <div className="flex items-center gap-0.5 text-xs font-semibold text-amber-500 shrink-0">
            <Star size={11} fill="currentColor" /> {builder.rating}
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
          <MapPin size={10} /> {builder.location}
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-slate-700">{builder.projects}</p>
            <p className="text-[10px] text-slate-400">Projects</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-slate-700">{builder.totalValue}</p>
            <p className="text-[10px] text-slate-400">Total Value</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          {builder.sectors.slice(0, 3).map((s) => (
            <span key={s} className="tag-teal text-[10px]">{s}</span>
          ))}
        </div>
        <Link
          to="/dealroom"
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border-2 border-brand-300 text-brand-700 hover:bg-brand-50 transition-colors"
        >
          View Profile
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
    <div className="p-6 max-w-5xl">
      <Link to="/investor-dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 mb-4">
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
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search builders, companies, locations..."
          className="w-full max-w-md border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-colors bg-white shadow-card"
        />
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.slice(0, 9).map((b) => (
          <FeedBuilderCard key={b.id} builder={b} />
        ))}
      </div>
    </div>
  );
}
