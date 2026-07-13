/*
 * AdminOverview.jsx — Admin console landing page (/admin).
 *
 * Fetches GET /api/v1/admin/metrics and renders a row of KPI stat cards
 * (total users, builders, investors, listed projects, pending verifications —
 * a click-through to /admin/verifications with an amber accent when > 0, and
 * quote requests) plus a 12-week signups bar chart (Recharts) styled to match
 * the dashboard analytics charts. Loading, error and empty states included.
 */
import { Link } from 'react-router-dom';
import {
  Users, Building2, TrendingUp, FolderKanban, ShieldCheck, FileText, AlertTriangle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAuthedApi } from '../../lib/useAuthedApi';
import { SkeletonKPI } from '../../components/ui/SkeletonCard';

const BRAND = '#2b5e93';
const TOOLTIP_STYLE = {
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
  fontSize: '12px',
};

function StatCard({ label, value, icon: Icon, color, to, accent }) {
  const body = (
    <div
      className={[
        'group bg-white rounded-2xl border shadow-card p-4 flex flex-col gap-3 transition-all duration-200 h-full',
        accent ? 'border-amber-200 hover:shadow-card-hover hover:-translate-y-1' : 'border-slate-100',
        to ? 'hover:shadow-card-hover hover:-translate-y-1 cursor-pointer' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-slate-500 font-medium leading-snug">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={15} />
        </div>
      </div>
      <span className="text-3xl font-bold text-slate-800 leading-none font-display tabular-nums">
        {value}
      </span>
      {to && accent && (
        <span className="text-[11px] font-semibold text-amber-600 inline-flex items-center gap-1">
          Review now <TrendingUp size={11} />
        </span>
      )}
    </div>
  );
  return to ? <Link to={to} className="block h-full">{body}</Link> : body;
}

export default function AdminOverview() {
  const { data, loading, error } = useAuthedApi('/api/v1/admin/metrics');
  const counts  = data?.data?.counts || {};
  const signups = data?.data?.signups || [];

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Admin Overview</h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform activity and moderation at a glance</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonKPI key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card border border-slate-100">
          <AlertTriangle size={24} className="mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-600 mb-1">Couldn't load metrics</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Users"    value={counts.total_users ?? 0}          icon={Users}       color="bg-brand-50 text-brand-600" />
            <StatCard label="Builders"       value={counts.builders ?? 0}             icon={Building2}   color="bg-brand-50 text-brand-600" />
            <StatCard label="Investors"      value={counts.investors ?? 0}            icon={TrendingUp}  color="bg-brand-50 text-brand-600" />
            <StatCard label="Listed Projects" value={counts.projects ?? 0}            icon={FolderKanban} color="bg-brand-50 text-brand-600" />
            <StatCard
              label="Pending Verifications"
              value={counts.pending_verifications ?? 0}
              icon={ShieldCheck}
              color={counts.pending_verifications > 0 ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600'}
              to="/admin/verifications"
              accent={counts.pending_verifications > 0}
            />
            <StatCard label="Quote Requests" value={counts.quotes ?? 0}               icon={FileText}    color="bg-brand-50 text-brand-600" />
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-0.5">New Signups</h2>
            <p className="text-xs text-slate-400 mb-4">Weekly account creation over the last 12 weeks</p>
            {signups.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No signup data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={signups} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [v, 'Signups']} />
                  <Bar dataKey="count" fill={BRAND} radius={[6, 6, 0, 0]} maxBarSize={34} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
