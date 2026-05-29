/*
 * InvestorCard.jsx — Reusable display card for an investor profile.
 *
 * Renders a card with a branded gradient header containing a large initials
 * avatar and optional verified badge, followed by investor name, type, and
 * location, active investment and portfolio value stats, an investment range
 * highlight, sector tags, and a "View Profile" CTA button. Accepts an investor
 * data object as a prop.
 */
import { MapPin, Activity, BarChart2, CheckCircle2, ArrowRight, DollarSign } from 'lucide-react';

export default function InvestorCard({ investor }) {
  const {
    initials, name, type, location, activeInvestments,
    portfolioValue, investmentRange, sectors, verified,
    gradientFrom, gradientTo,
  } = investor;

  return (
    <div className="card group cursor-pointer overflow-hidden flex flex-col">

      {/* ── Gradient header ── */}
      <div
        className="relative h-32 flex flex-col items-center justify-center gap-2"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      >
        {/* Verified badge */}
        {verified && (
          <div className="absolute top-3 right-3">
            <span className="verified-badge text-[11px]">
              <CheckCircle2 size={11} />
              Verified
            </span>
          </div>
        )}

        {/* Large initials avatar */}
        <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-xl font-bold shadow-lg">
          {initials}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 py-4 flex flex-col gap-3 flex-1">

        {/* Name + type */}
        <div className="text-center">
          <h3 className="font-semibold text-slate-800 text-sm">{name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{type}</p>
        </div>

        {/* Location */}
        <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
          <MapPin size={11} className="text-brand-500" />
          {location}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 border-t border-slate-50 pt-3">
          <div className="bg-slate-50 rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-1">
              <Activity size={10} />Active Investments
            </div>
            <p className="text-sm font-bold text-slate-800">{activeInvestments}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-1">
              <BarChart2 size={10} />Portfolio Value
            </div>
            <p className="text-sm font-bold text-brand-700">{portfolioValue}</p>
          </div>
        </div>

        {/* Investment range */}
        <div className="flex items-center gap-1.5 bg-amber-50 rounded-xl px-3 py-2">
          <DollarSign size={12} className="text-amber-600 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-500">Investment Range</p>
            <p className="text-xs font-semibold text-amber-700">{investmentRange}</p>
          </div>
        </div>

        {/* Sector tags */}
        <div className="flex flex-wrap gap-1.5">
          {sectors.slice(0, 3).map((s) => (
            <span key={s} className="tag-teal text-[10px] px-2 py-0.5">{s}</span>
          ))}
        </div>

        {/* CTA */}
        <button className="mt-auto btn-brand w-full py-2 text-xs">
          View Profile <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
