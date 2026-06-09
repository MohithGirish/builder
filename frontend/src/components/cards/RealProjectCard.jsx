/*
 * RealProjectCard.jsx — Auth-aware premium card for real Hyderabad real-estate projects.
 *
 * Renders a magazine-style card with a tall project thumbnail, category and status
 * badges (non-overlapping), project name overlay with glassmorphism gradient, location,
 * price range pill, three key highlight stats, developer name, and a gradient CTA button.
 * Hover state lifts the card and applies a dynamic colored glow derived from the project
 * brand color. On click, navigates authenticated+onboarded users to /projects/:id;
 * otherwise saves the intended destination to sessionStorage and redirects to login.
 */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, ArrowRight, Building2, IndianRupee } from 'lucide-react';

export default function RealProjectCard({ project }) {
  const navigate = useNavigate();
  const { isAuthenticated, onboardingComplete } = useAuth();

  function handleClick() {
    if (isAuthenticated && onboardingComplete) {
      navigate(`/projects/${project.id}`);
    } else {
      sessionStorage.setItem('builderai_redirect', `/projects/${project.id}`);
      navigate('/login', { state: { from: { pathname: `/projects/${project.id}` } } });
    }
  }

  function handleMouseEnter(e) {
    e.currentTarget.style.boxShadow = `0 24px 64px -12px ${project.color}40, 0 8px 32px -8px rgba(0,0,0,0.14)`;
  }

  function handleMouseLeave(e) {
    e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(0,0,0,0.10)';
  }

  const categoryLabel = {
    commercial: 'Commercial',
    residential: 'Residential',
    villa: 'Villa Community',
  }[project.category] || project.type;

  const hasPrice =
    project.priceRange &&
    project.priceRange !== 'On Request' &&
    project.priceRange !== 'Available on Request';

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer bg-white border border-slate-100 transition-all duration-500 hover:-translate-y-2 w-full"
      style={{ boxShadow: '0 4px 16px -4px rgba(0,0,0,0.10)' }}
    >
      {/* ── Hero image ── */}
      <div className="relative h-56 overflow-hidden shrink-0">
        <img
          src={project.thumbnail}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Multi-stop gradient: strong dark bottom, subtle top scrim */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.30) 45%, rgba(0,0,0,0.10) 70%, transparent 100%)',
          }}
        />

        {/* Category badge — top-left, owns its own space */}
        <div className="absolute top-3 left-3">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
            style={{ background: project.color, backdropFilter: 'blur(6px)' }}
          >
            {categoryLabel}
          </span>
        </div>

        {/* Status badge — top-right, never clashes with category */}
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/90 text-slate-700 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            {project.status}
          </span>
        </div>

        {/* Project name + tagline overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12">
          <h3 className="text-white font-extrabold text-[1.15rem] leading-snug drop-shadow-lg">
            {project.name}
          </h3>
          <p className="text-white/70 text-[11px] mt-1 leading-relaxed line-clamp-1">
            {project.tagline}
          </p>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 px-4 pt-3.5 pb-4 gap-3">

        {/* Location + price row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin size={11} className="text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 truncate">{project.location}</span>
          </div>
          {hasPrice && (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
              <IndianRupee size={9} className="shrink-0" />
              {project.priceRange.replace('₹', '')}
            </span>
          )}
        </div>

        {/* Highlights — 3-column stat chips */}
        <div className="grid grid-cols-3 gap-1.5">
          {project.highlights.slice(0, 3).map(h => (
            <div
              key={h.label}
              className="flex flex-col items-center justify-center bg-slate-50 rounded-xl px-1.5 py-2.5 text-center"
            >
              <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide leading-none">
                {h.label}
              </p>
              <p className="text-[11px] font-bold text-slate-800 mt-1 w-full truncate text-center leading-none">
                {h.value}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Developer */}
        {project.developer && project.developer !== 'Available on Request' && (
          <div className="flex items-center gap-1.5">
            <Building2 size={11} className="text-slate-400 shrink-0" />
            <span className="text-[10px] text-slate-400 truncate">{project.developer}</span>
          </div>
        )}

        {/* CTA button */}
        <button
          className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 group-hover:brightness-110 group-hover:shadow-lg"
          style={{ background: project.gradient }}
          tabIndex={-1}
        >
          View Project Details
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>
      </div>

      {/* Bottom brand accent line — reveals on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl"
        style={{ background: project.gradient }}
      />
    </div>
  );
}
