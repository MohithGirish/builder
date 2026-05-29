/*
 * KPICard.jsx — Key Performance Indicator metric card for dashboards.
 *
 * Renders a single KPI metric with a labeled icon, a large primary value, an
 * optional sub-text, and an optional period-over-period change badge (green
 * for positive, red for negative). The icon is resolved from a string name
 * (e.g. "Briefcase") via an internal ICON_MAP. Used in builder, investor,
 * and analytics dashboard pages.
 */
import {
  Briefcase, TrendingUp, Users, Eye, Wallet,
  Sparkles, Star, BarChart3, ArrowUp, ArrowDown,
} from 'lucide-react';

const ICON_MAP = {
  Briefcase, TrendingUp, Users, Eye, Wallet, Sparkles, Star, BarChart3,
};

export default function KPICard({ label, value, subtext, change, positive, icon, color }) {
  const Icon = ICON_MAP[icon] || Briefcase;

  return (
    <div className="group bg-white rounded-2xl shadow-card p-5 flex items-start gap-4 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${color}`}>
        <Icon size={20} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-slate-800 leading-none font-display tabular-nums">{value}</span>
          {subtext && <span className="text-xs text-slate-400 font-medium">{subtext}</span>}
        </div>
        {change && (
          <div className="mt-1.5">
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                positive
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {positive ? <ArrowUp size={10} /> : <ArrowDown size={10} />} {change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
