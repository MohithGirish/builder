/*
 * InvestorDashboard.jsx — Main overview page for the investor role.
 *
 * Renders a personalised welcome header, four KPI skeleton cards for 350ms
 * then real KPI cards from INVESTOR_KPIS, and an AI Builder Recommendations
 * panel. Cards use clean anatomy (no cover images): large avatar, name,
 * match badge, stats row, sector tags, CTA. Serves as the index route for
 * the /investor-dashboard nested route group.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, MapPin, Star } from 'lucide-react';
import KPICard from '../../components/dashboard/KPICard';
import { SkeletonKPI } from '../../components/ui/SkeletonCard';
import { useAuth } from '../../context/AuthContext';
import {
  INVESTOR_KPIS, BUILDER_RECOMMENDATIONS,
} from '../../data/dashboard';

function BuilderRecommendCard({ builder, featured }) {
  if (featured) {
    return (
      <div className="bg-white rounded-2xl shadow-card flex flex-col h-full transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">

        {/* Top row: avatar + match badge */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold text-white shrink-0"
            style={{ background: builder.avatar_color }}
          >
            {builder.initials}
          </div>
          <span
            className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}
          >
            {builder.match_score}% Match
          </span>
        </div>

        {/* Name + company + location */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className="text-base font-semibold text-slate-900">{builder.name}</h3>
            {builder.is_verified && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}
              >
                <CheckCircle2 size={8} /> Verified
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">{builder.company}</p>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <MapPin size={10} /> {builder.city}, {builder.state}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 mx-5" />

        {/* Stats row */}
        <div className="grid grid-cols-2 px-5 py-3 gap-x-4">
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">Projects</p>
            <p className="text-sm font-semibold text-slate-800">{builder.projects}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">Total Value</p>
            <p className="text-sm font-semibold text-teal-700">{builder.total_value}</p>
          </div>
        </div>

        {/* Sectors */}
        <div className="flex flex-wrap gap-1.5 px-5 pb-4 flex-1">
          {builder.sectors.slice(0, 3).map((s) => (
            <span key={s} className="tag-teal text-[11px]">{s}</span>
          ))}
        </div>

        {/* Rating + CTA */}
        <div className="px-5 pb-5 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
            <Star size={12} fill="currentColor" /> {builder.rating}
          </div>
          <Link
            to="/investor-dashboard/matches"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#0d9488,#14c38e)' }}
          >
            View Profile <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow duration-200">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ background: builder.avatar_color }}
      >
        {builder.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-slate-800 truncate">{builder.name}</p>
          {builder.is_verified && (
            <span
              className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}
            >
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
        <span
          className="px-2 py-1 rounded-full text-[11px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}
        >
          {builder.match_score}%
        </span>
        <Link
          to="/investor-dashboard/matches"
          className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 transition-colors"
        >
          View →
        </Link>
      </div>
    </div>
  );
}

export default function InvestorDashboard() {
  const { user } = useAuth();
  const [kpiLoading, setKpiLoading] = useState(true);
  const [featured, ...rest] = BUILDER_RECOMMENDATIONS;

  useEffect(() => {
    const t = setTimeout(() => setKpiLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">
          Welcome back, {user.first_name}!
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Your investment portfolio overview</p>
      </div>

      {/* KPI row — skeleton until data ready */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {kpiLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)
          : INVESTOR_KPIS.map((kpi) => <KPICard key={kpi.id} {...kpi} />)
        }
      </div>

      {/* AI Builder Recommendations */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#0d9488,#14c38e)' }}
            >
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">AI Builder Recommendations</h2>
              <p className="text-[11px] text-slate-400">Top 3 builders matching your investment criteria</p>
            </div>
          </div>
          <Link
            to="/investor-dashboard/matches"
            className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
          >
            View All Builders <ArrowRight size={13} />
          </Link>
        </div>

        {BUILDER_RECOMMENDATIONS.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Sparkles size={28} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">AI Matches Coming Soon</p>
            <p className="text-xs mt-1 max-w-xs mx-auto">
              Complete your investor profile so the AI engine can surface the best builder matches for you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {featured && <BuilderRecommendCard builder={featured} featured />}
            <div className="lg:col-span-2 flex flex-col gap-3">
              {rest.map((b) => (
                <BuilderRecommendCard key={b.id} builder={b} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
