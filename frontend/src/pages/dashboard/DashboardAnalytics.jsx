/*
 * DashboardAnalytics.jsx — Analytics and insights page for both dashboard roles.
 *
 * Renders role-aware KPI cards with 350ms skeleton, an AI market insight banner,
 * and a tabbed chart panel: Trends (Recharts LineChart), Sectors (Recharts
 * horizontal BarChart), and Distribution (inline SVG donut). All charts use
 * ResponsiveContainer so they never overflow on mobile. Accessible at
 * /dashboard/analytics and /investor-dashboard/analytics.
 */
import { useState, useEffect } from 'react';
import { Download, Sparkles } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import KPICard from '../../components/dashboard/KPICard';
import { SkeletonKPI } from '../../components/ui/SkeletonCard';
import { useAuth } from '../../context/AuthContext';
import {
  BUILDER_ANALYTICS_KPIS, INVESTOR_ANALYTICS_KPIS,
  BUILDER_CHART_DATA, INVESTOR_CHART_DATA,
  BUILDER_AI_INSIGHT, INVESTOR_AI_INSIGHT,
} from '../../data/dashboard';

const CHART_TABS = ['Trends', 'Sectors', 'Distribution'];
const DONUT_COLORS = ['#2b5e93', '#f97316', '#7c3aed', '#0891b2', '#d97706'];

const TOOLTIP_STYLE = {
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
  fontSize: '12px',
};

function DonutChart({ data, labels, colors }) {
  const total = data.reduce((a, b) => a + b, 0);
  let angle = -90;
  const R = 60, CX = 80, CY = 80;

  function polarToXY(deg, r) {
    const rad = (deg * Math.PI) / 180;
    return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
  }

  const slices = data.map((val, i) => {
    const pct = val / total;
    const sweep = pct * 360;
    const startAngle = angle;
    angle += sweep;
    const [x1, y1] = polarToXY(startAngle, R);
    const [x2, y2] = polarToXY(angle - 0.01, R);
    const large = sweep > 180 ? 1 : 0;
    return {
      path: `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`,
      color: colors[i],
      pct: Math.round(pct * 100),
    };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="w-32 h-32 shrink-0">
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
        <circle cx={CX} cy={CY} r={36} fill="white" />
        <text x={CX} y={CY + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#2b5e93">
          {total}%
        </text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {labels.map((l, i) => (
          <div key={l} className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i] }} />
            {l}
            <span className="font-semibold text-slate-800 ml-auto pl-3">{data[i]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardAnalytics() {
  const { role } = useAuth();
  const [tab, setTab]           = useState('Trends');
  const [kpiLoading, setKpiLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setKpiLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const kpis      = role === 'builder' ? BUILDER_ANALYTICS_KPIS : INVESTOR_ANALYTICS_KPIS;
  const chartData = role === 'builder' ? BUILDER_CHART_DATA     : INVESTOR_CHART_DATA;
  const insight   = role === 'builder' ? BUILDER_AI_INSIGHT      : INVESTOR_AI_INSIGHT;
  const trendKey  = role === 'builder' ? 'funding_trend'         : 'investment_trend';
  const trend     = chartData[trendKey];

  /* Build flat data arrays for Recharts */
  const trendData = trend.months.map((month, i) => {
    const obj = { month };
    trend.series.forEach((s) => { obj[s.name] = s.data[i]; });
    return obj;
  });

  const sectorData = chartData.sectors.map((s, i) => ({
    sector: s,
    value: chartData.sector_data[i],
  }));

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Analytics &amp; Insights</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track your performance and make data-driven decisions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-brand-700 bg-white border border-brand-200 hover:bg-brand-50 transition-colors shadow-card shrink-0">
          <Download size={14} /> Export Report
        </button>
      </div>

      {/* KPI row — skeleton until data ready */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpiLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)
          : kpis.map((kpi) => <KPICard key={kpi.label} {...kpi} color="bg-brand-50 text-brand-600" />)
        }
      </div>

      {/* AI Insight */}
      <div
        className="rounded-2xl p-5 mb-6 flex items-start gap-4"
        style={{ background: 'linear-gradient(135deg,#2b5e93,#1e3a5f)' }}
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-white/80 uppercase tracking-widest mb-1">AI-Powered Market Insight</p>
          <p className="text-sm text-white leading-relaxed">{insight}</p>
        </div>
      </div>

      {/* Chart tabs */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex items-center gap-1 mb-5 border-b border-slate-100 pb-4">
          {CHART_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={tab === t ? 'tab-active' : 'tab-inactive'}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Trends tab — Recharts LineChart */}
        {tab === 'Trends' && (
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-0.5">{trend.label}</h3>
            <p className="text-xs text-slate-400 mb-4">{trend.subtitle}</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                  iconType="circle"
                  iconSize={8}
                />
                {trend.series.map((s) => (
                  <Line
                    key={s.name}
                    type="monotone"
                    dataKey={s.name}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={{ r: 4, fill: s.color, stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sectors tab — Recharts horizontal BarChart */}
        {tab === 'Sectors' && (
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4">Sector Distribution</h3>
            <ResponsiveContainer width="100%" height={Math.max(180, sectorData.length * 44)}>
              <BarChart
                data={sectorData}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="sector"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => [`${v}%`, 'Share']}
                />
                <Bar
                  dataKey="value"
                  fill="#2b5e93"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Distribution tab — SVG donut */}
        {tab === 'Distribution' && (
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4">Portfolio Distribution</h3>
            <DonutChart
              data={chartData.sector_data}
              labels={chartData.sectors}
              colors={DONUT_COLORS}
            />
          </div>
        )}
      </div>
    </div>
  );
}
