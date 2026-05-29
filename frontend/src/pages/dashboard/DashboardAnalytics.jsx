/*
 * DashboardAnalytics.jsx — Analytics and insights page for both dashboard roles.
 *
 * Renders role-aware KPI cards, an AI-powered market insight banner, and a
 * tabbed chart panel with three views: Trends (SVG line chart via MiniLineChart),
 * Sectors (horizontal bar chart), and Distribution (inline SVG donut chart).
 * All data is sourced from the dashboard data module and adapted to the
 * authenticated user's role (builder vs investor). Accessible at
 * /dashboard/analytics and /investor-dashboard/analytics.
 */
import { useState } from 'react';
import { Download, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import KPICard from '../../components/dashboard/KPICard';
import MiniLineChart from '../../components/dashboard/MiniLineChart';
import { useAuth } from '../../context/AuthContext';
import {
  BUILDER_ANALYTICS_KPIS, INVESTOR_ANALYTICS_KPIS,
  BUILDER_CHART_DATA, INVESTOR_CHART_DATA,
  BUILDER_AI_INSIGHT, INVESTOR_AI_INSIGHT,
} from '../../data/dashboard';

const CHART_TABS = ['Trends', 'Sectors', 'Distribution'];

function DonutChart({ data, labels, colors }) {
  const total  = data.reduce((a, b) => a + b, 0);
  let angle    = -90;
  const R      = 60;
  const CX     = 80;
  const CY     = 80;

  function polarToXY(deg, r) {
    const rad = (deg * Math.PI) / 180;
    return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
  }

  const slices = data.map((val, i) => {
    const pct       = val / total;
    const sweep     = pct * 360;
    const startAngle = angle;
    angle += sweep;
    const endAngle  = angle;
    const [x1, y1]  = polarToXY(startAngle, R);
    const [x2, y2]  = polarToXY(endAngle - 0.01, R);
    const large      = sweep > 180 ? 1 : 0;
    return { path: `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`, color: colors[i], pct: Math.round(pct * 100) };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="w-32 h-32 shrink-0">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} />
        ))}
        <circle cx={CX} cy={CY} r={36} fill="white" />
        <text x={CX} y={CY + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f766e">
          {total}%
        </text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {labels.map((l, i) => (
          <div key={l} className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i] }} />
            {l} <span className="font-semibold text-slate-800 ml-auto pl-3">{data[i]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const DONUT_COLORS = ['#0d9488', '#f97316', '#7c3aed', '#0891b2', '#d97706'];

export default function DashboardAnalytics() {
  const { role }   = useAuth();
  const [tab, setTab] = useState('Trends');

  const kpis       = role === 'builder' ? BUILDER_ANALYTICS_KPIS : INVESTOR_ANALYTICS_KPIS;
  const chartData  = role === 'builder' ? BUILDER_CHART_DATA     : INVESTOR_CHART_DATA;
  const insight    = role === 'builder' ? BUILDER_AI_INSIGHT      : INVESTOR_AI_INSIGHT;
  const trendKey   = role === 'builder' ? 'funding_trend'         : 'investment_trend';
  const trend      = chartData[trendKey];

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Analytics &amp; Insights</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track your performance and make data-driven decisions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-brand-700 bg-white border border-brand-200 hover:bg-brand-50 transition-colors shadow-card">
          <Download size={14} /> Export Report
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} color="bg-teal-50 text-teal-600" />
        ))}
      </div>

      {/* AI Insight */}
      <div className="rounded-2xl p-5 mb-6 flex items-start gap-4"
           style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)' }}>
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
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                tab === t
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              style={tab === t ? { background: 'linear-gradient(135deg,#0d9488,#14c38e)' } : {}}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Trends' && (
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-0.5">{trend.label}</h3>
            <p className="text-xs text-slate-400 mb-4">{trend.subtitle}</p>
            <MiniLineChart series={trend.series} months={trend.months} height={200} />
            {/* Legend */}
            <div className="flex items-center gap-5 mt-3 justify-center">
              {trend.series.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-3 h-1.5 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Sectors' && (
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4">Sector Distribution</h3>
            <div className="space-y-3">
              {chartData.sectors.map((sector, i) => (
                <div key={sector}>
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>{sector}</span>
                    <span className="font-semibold">{chartData.sector_data[i]}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${chartData.sector_data[i]}%`,
                        background: DONUT_COLORS[i % DONUT_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
