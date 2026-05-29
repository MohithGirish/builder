/*
 * ProjectCard.jsx — Reusable display card for an investment project.
 *
 * Renders a card with a project image, sector and funding-stage badges, a
 * location overlay, funding progress bar with raised/goal amounts, timeline
 * and minimum investment stats, feature tags, and a "View Project Details"
 * CTA button. Uses SECTOR_COLORS and STAGE_COLORS maps for badge styling.
 * Accepts a project data object as a prop.
 */
import { MapPin, Clock, IndianRupee, ArrowRight, TrendingUp } from 'lucide-react';

const SECTOR_COLORS = {
  'Real Estate':    'bg-teal-600',
  'Infrastructure': 'bg-blue-600',
  'Commercial':     'bg-purple-600',
  'Smart Cities':   'bg-indigo-600',
  'Funding':        'bg-green-600',
  'Residential':    'bg-rose-600',
};

const STAGE_COLORS = {
  'Funding':   'bg-orange-500',
  'Active':    'bg-green-500',
  'Completed': 'bg-slate-500',
};

export default function ProjectCard({ project }) {
  const {
    title, builder, location, sector, stage, image,
    raised, goal, progress, timeline, required, minInvestment, tags,
  } = project;

  return (
    <div className="card group cursor-pointer overflow-hidden flex flex-col">

      {/* ── Image ── */}
      <div className="relative h-48 overflow-hidden bg-slate-200">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Top-left tags */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`text-[10px] font-semibold text-white px-2.5 py-1 rounded-full ${SECTOR_COLORS[sector] || 'bg-slate-600'}`}>
            {sector}
          </span>
          <span className={`text-[10px] font-semibold text-white px-2.5 py-1 rounded-full ${STAGE_COLORS[stage] || 'bg-slate-600'}`}>
            {stage}
          </span>
        </div>

        {/* Bottom-left title overlay */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">{title}</h3>
          <div className="flex items-center gap-1 text-white/80 text-xs mt-1">
            <MapPin size={10} />{location}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 py-4 flex flex-col gap-3 flex-1">

        {/* Funding progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500">Funding Progress</span>
            <span className="text-xs font-bold text-brand-700">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-slate-500">Raised: ₹{raised} Cr</span>
            <span className="text-[11px] text-slate-500">Goal: {required}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 border-t border-slate-50 pt-2">
          <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-2">
            <Clock size={12} className="text-brand-500 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500">Timeline</p>
              <p className="text-xs font-semibold text-slate-700">{timeline}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-2">
            <IndianRupee size={12} className="text-amber-500 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500">Min. Investment</p>
              <p className="text-xs font-semibold text-slate-700">{minInvestment}</p>
            </div>
          </div>
        </div>

        {/* Feature tags */}
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 2).map((t) => (
            <span key={t} className="tag-gray text-[10px] px-2 py-0.5">{t}</span>
          ))}
          {tags.length > 2 && (
            <span className="tag-teal text-[10px] px-2 py-0.5">+{tags.length - 2} more</span>
          )}
        </div>

        {/* CTA */}
        <button className="mt-auto btn-brand w-full py-2 text-xs">
          View Project Details <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
