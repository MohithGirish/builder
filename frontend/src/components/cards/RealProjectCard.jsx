/*
 * RealProjectCard.jsx — Auth-aware card for real Hyderabad real-estate projects.
 *
 * Renders a card with a project thumbnail, category and status badges, project
 * name and tagline overlay, location, four highlight specs, developer name, and
 * a CTA button styled with the project's brand gradient. On click, navigates
 * authenticated+onboarded users to /projects/:id; otherwise saves the intended
 * destination to sessionStorage and redirects to login.
 */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, ArrowRight, Building2 } from 'lucide-react';

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

  const categoryLabel = {
    commercial: 'Commercial',
    residential: 'Residential',
    villa: 'Villa Community',
  }[project.category] || project.type;

  return (
    <div
      onClick={handleClick}
      className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border border-slate-100 hover:-translate-y-1 w-full"
    >
      {/* Hero image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={project.thumbnail}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }}
        />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
            style={{ background: project.color + 'dd', backdropFilter: 'blur(4px)' }}
          >
            {categoryLabel}
          </span>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/90 text-slate-700">
            {project.status}
          </span>
        </div>

        {/* Project name on image */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white font-extrabold text-lg leading-tight drop-shadow-md">{project.name}</p>
          <p className="text-white/80 text-[11px] mt-0.5 drop-shadow-sm">{project.tagline}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={12} className="text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 truncate">{project.location}</span>
        </div>

        {/* Highlights grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {project.highlights.slice(0, 4).map(h => (
            <div key={h.label} className="bg-slate-50 rounded-xl px-2.5 py-2">
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">{h.label}</p>
              <p className="text-[11px] font-bold text-slate-700 truncate">{h.value}</p>
            </div>
          ))}
        </div>

        {/* Developer */}
        {project.developer && project.developer !== 'Available on Request' && (
          <div className="flex items-center gap-1.5 mb-4">
            <Building2 size={11} className="text-slate-400 shrink-0" />
            <span className="text-[10px] text-slate-400 truncate">{project.developer}</span>
          </div>
        )}

        {/* CTA */}
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all group-hover:opacity-90"
          style={{ background: project.gradient }}
          tabIndex={-1}
        >
          View Project Details
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
