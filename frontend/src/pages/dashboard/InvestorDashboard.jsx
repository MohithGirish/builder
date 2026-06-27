/*
 * InvestorDashboard.jsx — Main overview page for the investor role.
 *
 * Renders a personalised welcome header, four KPI skeleton cards for 350ms
 * then real KPI cards from INVESTOR_KPIS, and an AI Project Matches panel that
 * surfaces the onboarded real projects (PROJECT_MATCHES) the investor is
 * auto-matched with. Each match card shows a match score, location, type, and
 * a link to the project detail page. Serves as the index route for the
 * /investor-dashboard nested route group.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, MapPin } from 'lucide-react';
import KPICard from '../../components/dashboard/KPICard';
import { SkeletonKPI } from '../../components/ui/SkeletonCard';
import { useAuth } from '../../context/AuthContext';
import { INVESTOR_KPIS } from '../../data/dashboard';
import { PROJECT_MATCHES } from '../../data/realProjects';

function ProjectMatchCard({ project }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow duration-200 border border-slate-100">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ background: project.color }}
      >
        {project.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">{project.name}</p>
        <p className="text-[11px] text-slate-400 truncate">{project.type}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
          <MapPin size={10} /> {project.location}
        </p>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-2">
        <span className="px-2 py-1 rounded-full text-[11px] font-bold text-white bg-brand-gradient">
          {project.matchScore}%
        </span>
        <Link
          to={`/projects/${project.id}`}
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

      {/* AI Project Matches */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-gradient">
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">AI Project Matches</h2>
              <p className="text-[11px] text-slate-400">Projects matching your investment criteria</p>
            </div>
          </div>
          <Link
            to="/investor-dashboard/matches"
            className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
          >
            View All Matches <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {PROJECT_MATCHES.map((p) => (
            <ProjectMatchCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
