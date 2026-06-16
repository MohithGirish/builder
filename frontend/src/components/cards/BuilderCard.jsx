/*
 * BuilderCard.jsx — Reusable display card for a builder profile.
 *
 * No cover image. Clean anatomy: teal-gradient Avatar + verified badge,
 * name/company, divider, 2-col stats row (projects + total value), sector
 * Badge tags, and a full-width "View Profile" CTA. Card lifts -4px on hover.
 * Used in the Builders directory page and the Home discovery section.
 */
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Briefcase, TrendingUp } from 'lucide-react';

export default function BuilderCard({ builder }) {
  const { name, company, location, projects, totalValue, sectors, verified, projectId } = builder;

  const initials = (name || company || '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

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

      {/* ── Name + company ── */}
      <div className="px-5 pb-3">
        <h3 className="text-base font-semibold text-slate-900 leading-snug">{name}</h3>
        <p className="text-sm text-slate-500 mt-0.5 truncate">{company}</p>
        {location && (
          <p className="text-xs text-slate-400 mt-1 truncate">{location}</p>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-slate-100 mx-5" />

      {/* ── Stats row: 2-col ── */}
      <div className="grid grid-cols-2 px-5 py-3 gap-x-4">
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide flex items-center gap-1 mb-0.5">
            <Briefcase size={11} /> Projects
          </p>
          <p className="text-sm font-semibold text-slate-800">{projects}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide flex items-center gap-1 mb-0.5">
            <TrendingUp size={11} /> Total Value
          </p>
          <p className="text-sm font-semibold text-teal-700">{totalValue}</p>
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
        {projectId ? (
          <Link
            to={`/projects/${projectId}`}
            aria-label={`View project by ${name}`}
            className="btn-brand w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
          >
            View Project <ArrowRight size={13} />
          </Link>
        ) : (
          <button
            aria-label={`View profile of ${name}`}
            className="btn-brand w-full py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            View Profile <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
