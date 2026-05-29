/*
 * BuilderDashboard.jsx — Main overview page for the builder role.
 *
 * Renders a personalised welcome header, a row of four KPI cards drawn from
 * BUILDER_KPIS, and an AI Match Recommendations panel listing the top three
 * investor leads (INVESTOR_RECOMMENDATIONS) with match scores, sectors, and
 * a link to initiate a dealroom conversation. Serves as the index route for
 * the /dashboard nested route group.
 */
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, MapPin, Briefcase } from 'lucide-react';
import KPICard from '../../components/dashboard/KPICard';
import { useAuth } from '../../context/AuthContext';
import {
  BUILDER_KPIS, INVESTOR_RECOMMENDATIONS,
} from '../../data/dashboard';

function InvestorRecommendCard({ inv }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 flex items-start gap-4 hover:shadow-card-hover transition-shadow duration-300">
      {/* Avatar */}
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
        style={{ background: inv.avatar_color }}
      >
        {inv.initials}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-800">{inv.company}</span>
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
          {/* Match badge */}
          <span
            className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}
          >
            {inv.match_score}% Match
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {inv.sectors.map((s) => (
            <span key={s} className="tag-teal text-[11px]">{s}</span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-slate-500">
            <Briefcase size={11} className="inline mr-1" />
            Investment Range: {inv.investment_range}
          </p>
          <Link
            to="/dealroom"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(to right,#f97316,#f59e0b)' }}
          >
            Connect
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BuilderDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">
          Welcome back, {user.first_name}! 🎉
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Here's what's happening with your projects today
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {BUILDER_KPIS.map((kpi) => (
          <KPICard key={kpi.id} {...kpi} />
        ))}
      </div>

      {/* AI Match Recommendations */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#0d9488,#14c38e)' }}>
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">AI Match Recommendations</h2>
              <p className="text-[11px] text-slate-400">Top 3 investors for your projects</p>
            </div>
          </div>
          <Link
            to="/dashboard/matches"
            className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 transition-colors"
          >
            View All Matches <ArrowRight size={13} />
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {INVESTOR_RECOMMENDATIONS.map((inv) => (
            <InvestorRecommendCard key={inv.id} inv={inv} />
          ))}
        </div>
      </div>
    </div>
  );
}
