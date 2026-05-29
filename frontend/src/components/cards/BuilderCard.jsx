/*
 * BuilderCard.jsx — Reusable display card for a builder profile.
 *
 * Renders a card with a cover image, verified badge, avatar initials overlay,
 * builder name and company, location with star rating, project count and total
 * portfolio value stats, sector tags (up to 3 with overflow count), and a
 * "View Profile" CTA button. Accepts a builder data object as a prop.
 */
import { MapPin, Briefcase, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import StarRating from '../ui/StarRating';

export default function BuilderCard({ builder, compact = false }) {
  const { initials, name, company, location, rating, projects, totalValue, sectors, verified, image } = builder;

  return (
    <div className="card group cursor-pointer overflow-hidden flex flex-col">

      {/* ── Cover image ── */}
      <div className="relative h-44 overflow-hidden bg-slate-200">
        <img
          src={image}
          alt={company}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Verified badge top-right */}
        {verified && (
          <div className="absolute top-3 right-3">
            <span className="verified-badge text-[11px]">
              <CheckCircle2 size={11} />
              Verified
            </span>
          </div>
        )}

        {/* Avatar overlapping image bottom-left */}
        <div className="absolute -bottom-5 left-4">
          <div className="w-12 h-12 rounded-full border-2 border-white shadow-md avatar text-sm font-bold">
            {initials}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="pt-7 pb-4 px-4 flex flex-col gap-2 flex-1">

        {/* Name + company */}
        <div>
          <h3 className="font-semibold text-slate-800 text-sm leading-snug">{name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{company}</p>
        </div>

        {/* Location + rating */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={11} className="text-brand-500" />{location}
          </span>
          <StarRating rating={rating} />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 py-1 border-t border-slate-50">
          <div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Briefcase size={11} />
              <span>Projects</span>
            </div>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{projects}</p>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <TrendingUp size={11} />
              <span>Total Value</span>
            </div>
            <p className="text-sm font-bold text-brand-700 mt-0.5">{totalValue}</p>
          </div>
        </div>

        {/* Sector tags */}
        <div className="flex flex-wrap gap-1.5">
          {sectors.slice(0, 3).map((s) => (
            <span key={s} className="tag-teal text-[10px] px-2 py-0.5">{s}</span>
          ))}
          {sectors.length > 3 && (
            <span className="tag-gray text-[10px] px-2 py-0.5">+{sectors.length - 3}</span>
          )}
        </div>

        {/* CTA */}
        <button className="mt-auto btn-brand w-full py-2 text-xs">
          View Profile <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
