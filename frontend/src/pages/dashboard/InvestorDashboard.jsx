/*
 * InvestorDashboard.jsx — Main overview page for the investor role.
 *
 * Renders a personalised welcome header, four KPI cards from INVESTOR_KPIS,
 * and an AI Builder Recommendations panel. The panel features the top-ranked
 * builder in an image card (featured layout) and remaining recommendations
 * in a compact list. Each card links to /investor-dashboard/matches. Serves
 * as the index route for the /investor-dashboard nested route group.
 */
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, MapPin, Star } from 'lucide-react';
import KPICard from '../../components/dashboard/KPICard';
import { useAuth } from '../../context/AuthContext';
import {
  INVESTOR_KPIS, BUILDER_RECOMMENDATIONS,
} from '../../data/dashboard';

function BuilderRecommendCard({ builder, featured }) {
  if (featured) {
    return (
      <div className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300 relative">
        <div className="h-40 relative">
          <img
            src={builder.image_url}
            alt={builder.company}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {builder.is_verified && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}>
              <CheckCircle2 size={9} /> Verified
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                     style={{ background: builder.avatar_color }}>
                  {builder.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{builder.name}</p>
                  <p className="text-[11px] text-slate-400">{builder.company}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <MapPin size={10} /> {builder.city}, {builder.state}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}>
              {builder.match_score}% Match
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {builder.sectors.slice(0, 3).map((s) => (
              <span key={s} className="tag-teal text-[11px]">{s}</span>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-slate-500">
              Projects <span className="font-semibold text-slate-700">{builder.projects}</span>
              <span className="mx-2">·</span>
              Value <span className="font-semibold text-slate-700">{builder.total_value}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
              <Star size={11} fill="currentColor" /> {builder.rating}
            </div>
          </div>
          <Link
            to="/investor-dashboard/matches"
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(to right,#f97316,#f59e0b)' }}
          >
            View Profile <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow duration-300">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
           style={{ background: builder.avatar_color }}>
        {builder.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-slate-800 truncate">{builder.name}</p>
          {builder.is_verified && (
            <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}>
              <CheckCircle2 size={8} /> Verified
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 truncate">{builder.company}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {builder.sectors.slice(0, 2).map((s) => (
            <span key={s} className="tag-teal text-[10px]">{s}</span>
          ))}
        </div>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-2">
        <span className="px-2 py-1 rounded-full text-[11px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}>
          {builder.match_score}%
        </span>
        <Link
          to="/investor-dashboard/matches"
          className="text-[11px] font-semibold text-brand-700 hover:text-brand-800"
        >
          View →
        </Link>
      </div>
    </div>
  );
}

export default function InvestorDashboard() {
  const { user } = useAuth();
  const [featured, ...rest] = BUILDER_RECOMMENDATIONS;

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">
          Welcome back, {user.first_name}! 🎉
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Your investment portfolio overview</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {INVESTOR_KPIS.map((kpi) => (
          <KPICard key={kpi.id} {...kpi} />
        ))}
      </div>

      {/* AI Builder Recommendations */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#0d9488,#14c38e)' }}>
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">AI Builder Recommendations</h2>
              <p className="text-[11px] text-slate-400">Top 3 builders matching your investment criteria</p>
            </div>
          </div>
          <Link
            to="/investor-dashboard/matches"
            className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 transition-colors"
          >
            View All Builders <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <BuilderRecommendCard builder={featured} featured />
          <div className="lg:col-span-2 flex flex-col gap-3">
            {rest.map((b) => (
              <BuilderRecommendCard key={b.id} builder={b} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
