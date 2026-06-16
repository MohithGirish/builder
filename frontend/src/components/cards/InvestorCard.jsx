/*
 * InvestorCard.jsx — Reusable display card for an investor profile.
 *
 * No cover gradient header. Clean anatomy: initials Avatar (teal gradient),
 * verified Badge, name/type/location, divider, 2-col stats (active investments
 * + portfolio value), investment range highlight pill, sector Badge tags, and
 * a full-width "View Profile" CTA. Card lifts -4px with shadow on hover.
 */
import { MapPin, Activity, BarChart2, CheckCircle2, ArrowRight, DollarSign } from 'lucide-react';

export default function InvestorCard({ investor }) {
  const {
    initials, name, type, location, activeInvestments,
    portfolioValue, investmentRange, sectors, verified,
  } = investor;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-card flex flex-col h-full transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">

      {/* ── Top row: avatar + verified badge ── */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold text-white bg-brand-gradient shadow-sm shrink-0">
          {initials}
        </div>
        {verified && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold text-white bg-brand-gradient shrink-0">
            <CheckCircle2 size={9} /> Verified
          </span>
        )}
      </div>

      {/* ── Name + type ── */}
      <div className="px-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900 leading-snug">{name}</h3>
        <p className="text-sm text-slate-500 mt-0.5">{type}</p>
        {location && (
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <MapPin size={10} className="text-teal-500" /> {location}
          </p>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-slate-100 mx-5" />

      {/* ── Stats row: 2-col ── */}
      <div className="grid grid-cols-2 px-5 py-3 gap-x-4">
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide flex items-center gap-1 mb-0.5">
            <Activity size={11} /> Investments
          </p>
          <p className="text-sm font-semibold text-slate-800">{activeInvestments}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide flex items-center gap-1 mb-0.5">
            <BarChart2 size={11} /> Portfolio
          </p>
          <p className="text-sm font-semibold text-teal-700">{portfolioValue}</p>
        </div>
      </div>

      {/* ── Investment range pill ── */}
      <div className="mx-5 mb-3 flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2">
        <DollarSign size={12} className="text-amber-600 shrink-0" />
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-wide font-medium">Investment Range</p>
          <p className="text-xs font-semibold text-amber-700">{investmentRange}</p>
        </div>
      </div>

      {/* ── Sector tags ── */}
      <div className="flex flex-wrap gap-1.5 px-5 pb-4 flex-1">
        {sectors.slice(0, 3).map((s) => (
          <span
            key={s}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border border-slate-200 text-slate-600 bg-white"
          >
            {s}
          </span>
        ))}
        {sectors.length > 3 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
            +{sectors.length - 3}
          </span>
        )}
      </div>

      {/* ── CTA ── */}
      <div className="px-5 pb-5 mt-auto">
        <button
          aria-label={`View profile of ${name}`}
          className="btn-brand w-full py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          View Profile <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
