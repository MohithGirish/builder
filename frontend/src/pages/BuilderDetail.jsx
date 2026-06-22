/*
 * BuilderDetail.jsx — Public builder profile page (/builders/:id).
 *
 * Resolves a builder by slug via getBuilderById, then lists every project that
 * builder has in the catalogue as RealProjectCards (matched to REAL_PROJECTS by
 * id). Header shows the builder's name, verified badge, location, sector tags,
 * and aggregate project/portfolio stats. Reached from the Builders directory and
 * the Home discover section; renders a not-found state for unknown slugs.
 */
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Briefcase, TrendingUp, MapPin, Building2 } from 'lucide-react';
import { getBuilderById, initialsOf } from '../data/builders';
import { REAL_PROJECTS } from '../data/realProjects';
import RealProjectCard from '../components/cards/RealProjectCard';

export default function BuilderDetail() {
  const { id } = useParams();
  const builder = getBuilderById(id);

  if (!builder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Building2 size={28} className="text-slate-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-700 mb-1">Builder not found</h1>
          <p className="text-sm text-slate-500">This builder may have been removed or the link is incorrect.</p>
        </div>
        <Link to="/builders" className="btn-brand px-6 py-2.5 text-sm inline-flex items-center gap-1.5">
          <ArrowLeft size={15} /> Back to Builders
        </Link>
      </div>
    );
  }

  const initials = initialsOf(builder.name);

  // Match each nested project to its full REAL_PROJECTS record for the card.
  const projects = builder.projects
    .map((p) => REAL_PROJECTS.find((rp) => rp.id === p.projectId))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/60 to-slate-50">

      {/* ── Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <Link to="/builders" className="inline-flex items-center gap-1.5 text-teal-700 text-sm font-medium hover:text-teal-800 mb-6">
          <ArrowLeft size={15} /> Back to Builders
        </Link>

        <div className="flex items-start gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl font-semibold text-white bg-brand-gradient shadow-sm shrink-0">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{builder.name}</h1>
              {builder.verified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold text-white bg-brand-gradient">
                  <CheckCircle2 size={9} /> Verified
                </span>
              )}
            </div>

            {builder.location && (
              <p className="inline-flex items-center gap-1.5 text-sm text-slate-500 mb-4">
                <MapPin size={13} /> {builder.location}
              </p>
            )}

            {/* Stat chips */}
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-teal-700 text-white">
                <Briefcase size={12} /> {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500 text-white">
                <TrendingUp size={12} /> {builder.totalValue} Portfolio Value
              </span>
            </div>

            {/* Sector tags */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {builder.sectors.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-slate-200 text-slate-600 bg-white"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Projects grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Ongoing Projects</h2>
        <p className="text-xs text-slate-400 mb-5">
          {projects.length} {projects.length === 1 ? 'project' : 'projects'} by {builder.name}
        </p>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Building2 size={28} className="text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">No projects listed yet</h3>
            <p className="text-sm text-slate-500 max-w-xs">This builder's projects will appear here soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => <RealProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
