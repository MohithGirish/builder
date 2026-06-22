/*
 * Builders.jsx — Public builders directory page.
 *
 * Shows 6 skeleton cards for 350 ms on first render before real cards appear,
 * giving a polished loading feel. Searchable and filterable grid of builders
 * with location, sector, verified-only filters, and grid/list view toggle.
 * Uses SkeletonCard for loading state and an upgraded FilterBar.
 */
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, TrendingUp, Briefcase, ChevronDown, Users } from 'lucide-react';
import BuilderCard       from '../components/cards/BuilderCard';
import FilterBar         from '../components/filters/FilterBar';
import { SkeletonCard }  from '../components/ui/SkeletonCard';
import { UNIQUE_BUILDERS, SECTORS, LOCATIONS, TOTAL_PROJECTS, PORTFOLIO_VALUE } from '../data/builders';

const PAGE_SIZE = 6;

export default function Builders() {
  const [search,       setSearch]       = useState('');
  const [location,     setLocation]     = useState('All Location');
  const [sector,       setSector]       = useState('All Sectors');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [view,         setView]         = useState('grid');
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);

  /* Brief skeleton period to show loading state */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return UNIQUE_BUILDERS.filter((b) => {
      if (search) {
        const s = search.toLowerCase();
        const projectNames = b.projects.map((p) => p.name).join(' ').toLowerCase();
        if (
          !b.name.toLowerCase().includes(s) &&
          !b.location.toLowerCase().includes(s) &&
          !b.sectors.join(' ').toLowerCase().includes(s) &&
          !projectNames.includes(s)
        ) return false;
      }
      if (location !== 'All Location' && !b.location.includes(location)) return false;
      if (sector   !== 'All Sectors'  && !b.sectors.some((s) => s.toLowerCase().includes(sector.toLowerCase()))) return false;
      if (verifiedOnly && !b.verified) return false;
      return true;
    });
  }, [search, location, sector, verifiedOnly]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/60 to-slate-50">

      {/* ── Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-teal-700 text-sm font-medium hover:text-teal-800 mb-5">
          <ArrowLeft size={15} /> Back to Home
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Discover India's Premier Builders
        </h1>
        <p className="text-slate-500 text-sm mb-5 max-w-xl">
          Connect with verified, trusted builders and developers across India.
        </p>

        {/* Stat chips */}
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-teal-600 text-white">
            <CheckCircle2 size={12} /> {UNIQUE_BUILDERS.filter((b) => b.verified).length} Verified Builders
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500 text-white">
            <TrendingUp size={12} /> {PORTFOLIO_VALUE} Portfolio Value
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-teal-700 text-white">
            <Briefcase size={12} /> {TOTAL_PROJECTS} Projects
          </span>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 sticky top-14 z-20">
        <FilterBar
          search={search}               onSearch={setSearch}
          locationOptions={LOCATIONS}   location={location}     onLocation={setLocation}
          sectorOptions={SECTORS}       sector={sector}         onSector={setSector}
          verifiedOnly={verifiedOnly}   onVerifiedOnly={setVerifiedOnly}
          view={view}                   onView={setView}
          placeholder="Search builders, companies, specializations..."
        />
      </div>

      {/* ── Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {loading ? (
          /* Skeleton loading state — 6 cards */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty / no-results state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">
              {UNIQUE_BUILDERS.length === 0 ? 'No builders available' : 'No builders match your filters'}
            </h3>
            <p className="text-sm text-slate-500 max-w-xs">
              {UNIQUE_BUILDERS.length === 0
                ? 'The builder directory launches soon. Register now to be first.'
                : 'Try adjusting your search or clearing filters.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 mb-4">{filtered.length} builders found</p>
            <div className={view === 'grid'
              ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
            }>
              {visible.map((b) => <BuilderCard key={b.id} builder={b} />)}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-ghost px-8 py-2.5 text-sm flex items-center gap-2"
                >
                  Load More Builders <ChevronDown size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
