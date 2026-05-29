/*
 * Projects.jsx — Public projects directory page.
 *
 * Displays a searchable, filterable list of investment projects with support
 * for location, sector, and funding-stage filters plus grid/list view toggle
 * and infinite-load pagination. Also renders a highlighted section of real
 * Hyderabad projects (REAL_PROJECTS) above the main filterable list.
 * Back-navigation destination is determined by the user's auth and role state.
 */
import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle2, TrendingUp, IndianRupee, ChevronDown, MapPin } from 'lucide-react';
import ProjectCard     from '../components/cards/ProjectCard';
import RealProjectCard from '../components/cards/RealProjectCard';
import FilterBar       from '../components/filters/FilterBar';
import { PROJECTS, PROJECT_SECTORS, FUNDING_STAGES, PROJ_LOCATIONS } from '../data/projects';
import { REAL_PROJECTS } from '../data/realProjects';

const PAGE_SIZE = 6;

export default function Projects() {
  const routeLocation = useLocation();
  const navigate      = useNavigate();
  const { isAuthenticated, onboardingComplete, role } = useAuth();
  const backDest = isAuthenticated && onboardingComplete
    ? (role === 'investor' ? '/investor-dashboard' : '/dashboard')
    : '/';
  const [search,      setSearch]   = useState(() => new URLSearchParams(routeLocation.search).get('q') || '');
  const [location,    setLocation] = useState('All Location');
  const [sector,      setSector]   = useState('All Sectors');
  const [stage,       setStage]    = useState('All Stages');
  const [view,        setView]     = useState('grid');
  const [page,        setPage]     = useState(1);

  const filtered = useMemo(() => {
    return PROJECTS.filter((p) => {
      if (search) {
        const s = search.toLowerCase();
        if (
          !p.title.toLowerCase().includes(s) &&
          !p.builder.toLowerCase().includes(s) &&
          !p.location.toLowerCase().includes(s) &&
          !p.sector.toLowerCase().includes(s)
        ) return false;
      }
      if (location !== 'All Location' && !p.location.includes(location)) return false;
      if (sector   !== 'All Sectors'  && p.sector !== sector) return false;
      if (stage    !== 'All Stages'   && p.stage  !== stage)  return false;
      return true;
    });
  }, [search, location, sector, stage]);

  const totalFunding = PROJECTS.reduce((a, p) => a + p.raised, 0);
  const totalGoal    = PROJECTS.reduce((a, p) => a + p.goal, 0);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-slate-50">

      {/* ── Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <button
          onClick={() => navigate(backDest)}
          className="inline-flex items-center gap-1.5 text-brand-700 text-sm font-medium hover:text-brand-800 mb-5"
        >
          <ArrowLeft size={15} /> {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
        </button>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Browse Active Projects
        </h1>
        <p className="text-slate-500 text-sm mb-5 max-w-xl">
          Discover high-value real-estate and infrastructure investment opportunities
          across India's fastest-growing cities.
        </p>

        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-600 text-white">
            <CheckCircle2 size={12} /> {PROJECTS.length} Active Projects
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500 text-white">
            <TrendingUp size={12} /> ₹{totalGoal} Cr Total Funding Target
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-green-600 text-white">
            <IndianRupee size={12} /> ₹{totalFunding} Cr Already Raised
          </span>
        </div>
      </div>

      {/* ── Featured Real Projects ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-brand-600" />
            <h2 className="text-lg font-bold text-slate-800">Featured Hyderabad Projects</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">{REAL_PROJECTS.length} live projects</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {REAL_PROJECTS.map(project => (
            <RealProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <div className="border-t border-slate-200" />
        <p className="text-xs text-slate-400 mt-3 font-medium uppercase tracking-wider">More Active Investment Projects</p>
      </div>

      {/* ── Filter bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 sticky top-14 z-20">
        <FilterBar
          search={search}     onSearch={setSearch}
          locationOptions={PROJ_LOCATIONS} location={location} onLocation={setLocation}
          sectorOptions={PROJECT_SECTORS}  sector={sector}     onSector={setSector}
          view={view}   onView={setView}
          placeholder="Search projects, builders, sectors..."
        />
        {/* Funding stage tabs */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {FUNDING_STAGES.map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all
                ${stage === s
                  ? 'text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-400'}`}
              style={stage === s ? { background: 'linear-gradient(135deg,#0d9488,#14c38e)' } : {}}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-slate-600">No projects match your filters.</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 mb-4">{filtered.length} projects found</p>
            <div className={view === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
              {visible.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-outline-brand px-8 py-2.5 text-sm flex items-center gap-2"
                >
                  Load More Projects <ChevronDown size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
