/*
 * BuilderCard.jsx — Reusable display card for a unique builder.
 *
 * The whole card is a link to the builder's detail page (/builders/:id). A cover
 * banner pulled from one of the builder's own projects anchors the card; a
 * teal-gradient brand tile (initials) overlaps it with a white ring. Below: name,
 * location, a 2-up divided stats row (project count + portfolio value), sector
 * tags, and a "View Projects" CTA. Used in the Builders directory and Home discover.
 */
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Briefcase, TrendingUp, MapPin } from 'lucide-react';
import { initialsOf } from '../../data/builders';

export default function BuilderCard({ builder }) {
  const { id, name, location, projects, totalValue, sectors, verified, backdrop } = builder;
  const projectCount = Array.isArray(projects) ? projects.length : projects;
  const initials = initialsOf(name);

  return (
    <Link
      to={`/builders/${id}`}
      aria-label={`View projects by ${name}`}
      className="group flex flex-col h-full bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 focus-visible:outline-none"
    >
      {/* ── Cover: one of the builder's projects ── */}
      <div className="relative h-32 bg-slate-100 overflow-hidden shrink-0">
        {backdrop && (
          <img
            src={backdrop}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}
        {/* Subtle bottom scrim for depth where the tile overlaps */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
        {verified && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/95 text-brand-700 shadow-sm backdrop-blur-sm">
            <CheckCircle2 size={10} className="text-brand-600" /> Verified
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 px-5 pb-5">
        {/* Brand tile — overlaps the cover (relative z-10 keeps it above the scrim) */}
        <div className="relative z-10 -mt-9 mb-3 w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center text-white font-display font-bold text-xl shadow-lifted ring-4 ring-white">
          {initials}
        </div>

        {/* Name + location */}
        <h3 className="text-lg font-semibold text-slate-900 leading-snug truncate">{name}</h3>
        {location && (
          <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        )}

        {/* Stats — two tiles split by a hairline */}
        <div className="grid grid-cols-2 gap-px mt-4 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-100">
          <div className="bg-white px-3.5 py-3">
            <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-1">
              <Briefcase size={11} /> Projects
            </p>
            <p className="text-base font-semibold text-slate-900">{projectCount}</p>
          </div>
          <div className="bg-white px-3.5 py-3">
            <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-1">
              <TrendingUp size={11} /> Portfolio
            </p>
            <p className="text-base font-semibold text-brand-700">{totalValue}</p>
          </div>
        </div>

        {/* Sector tags */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {sectors.slice(0, 3).map((s) => (
            <span
              key={s}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-slate-200 text-slate-600"
            >
              {s}
            </span>
          ))}
          {sectors.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
              +{sectors.length - 3}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto pt-5">
          <span className="btn-brand w-full py-2.5 text-xs">
            View Projects
            <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
