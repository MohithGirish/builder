/*
 * KPICard.jsx — KPI metric card with a 7-day Recharts AreaChart sparkline.
 *
 * Blueprint Index KPI card: mono uppercase eyebrow label, large value in the
 * JetBrains Mono data voice, colored icon tile top-right, a top hairline accent
 * (brass when positive, steel otherwise), a change badge (emerald/red) with
 * TrendingUp/TrendingDown, and a pure-shape steel→azure Recharts sparkline.
 * Exports a single default KPICard that accepts label, value, change, positive,
 * icon (string key), color (Tailwind classes), and sparkline (number[]).
 */
import { useId } from 'react';
import {
  Briefcase, TrendingUp, TrendingDown, Users, Eye, Wallet,
  Sparkles, Star, BarChart3,
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer,
} from 'recharts';

const ICON_MAP = {
  Briefcase, TrendingUp, Users, Eye, Wallet, Sparkles, Star, BarChart3,
};

export default function KPICard({ label, value, subtext, change, positive, icon, color, sparkline = [] }) {
  const uid       = useId();
  const Icon      = ICON_MAP[icon] || Briefcase;
  const chartData = sparkline.map((v, i) => ({ i, v }));

  return (
    <div className="group relative overflow-hidden bg-gradient-to-br from-white to-brand-50/50 rounded-2xl border border-slate-200 shadow-card p-4 pt-5 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">

      {/* Blueprint coordinate-grid texture — the landing-page signature, whisper-faint */}
      <span className="coord-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />

      {/* Top hairline accent — brass on positive movement, steel otherwise (matches landing) */}
      <span
        className={`absolute top-0 left-4 right-4 h-px ${positive ? 'bg-brass' : 'bg-brand-200'}`}
        aria-hidden="true"
      />

      {/* Content sits above the texture */}
      <div className="relative flex flex-col gap-2">

      {/* Top row: mono eyebrow label + icon tile */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-[10px] text-slate-500 font-semibold uppercase tracking-[0.14em] leading-snug">
          {label}
        </p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={15} />
        </div>
      </div>

      {/* Value — JetBrains Mono data voice */}
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="text-3xl font-bold text-slate-800 leading-none font-mono tabular-nums tracking-tight">
          {value}
        </span>
        {subtext && <span className="text-xs text-slate-400 font-medium">{subtext}</span>}
      </div>

      {/* Change badge */}
      {change ? (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${
            positive
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {positive
            ? <TrendingUp size={10} />
            : <TrendingDown size={10} />
          }
          {change}
        </span>
      ) : (
        /* Placeholder spacer so all cards align the sparkline */
        <span className="h-[22px] block" />
      )}

      {/* Sparkline — no axes, no grid, pure area shape */}
      {chartData.length > 1 && (
        <div className="-mx-1 mt-1" aria-label={`${label} trend sparkline`} role="img">
          <ResponsiveContainer width="100%" height={44}>
            <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
              <defs>
                {/* ponytail: recharts needs literal hex — brand-600 steel + azure fill, mirrors .ci-fill in index.css */}
                <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#5aa0e0" stopOpacity={0.20} />
                  <stop offset="95%" stopColor="#5aa0e0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#2b5e93"
                strokeWidth={2}
                fill={`url(#grad-${uid})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      </div>
    </div>
  );
}
