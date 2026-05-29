/*
 * Builders.jsx — Public builders directory page.
 *
 * Renders a searchable and filterable list of verified builders with location,
 * sector, and verified-only filters plus grid/list view toggle and infinite-
 * load pagination. Displays summary stat chips (verified count, portfolio
 * value, total projects) above the filter bar. Filters are computed
 * client-side via useMemo against the static BUILDERS dataset.
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, TrendingUp, Briefcase, ChevronDown } from 'lucide-react';
import BuilderCard from '../components/cards/BuilderCard';
import FilterBar   from '../components/filters/FilterBar';
import { BUILDERS, SECTORS, LOCATIONS } from '../data/builders';

const PAGE_SIZE = 6;

export default function Builders() {
  const [search,      setSearch]      = useState('');
  const [location,    setLocation]    = useState('All Location');
  const [sector,      setSector]      = useState('All Sectors');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [view,        setView]        = useState('grid');
  const [page,        setPage]        = useState(1);

  const filtered = useMemo(() => {
    return BUILDERS.filter((b) => {
      if (search) {
        const s = search.toLowerCase();
        if (
          !b.name.toLowerCase().includes(s) &&
          !b.company.toLowerCase().includes(s) &&
          !b.location.toLowerCase().includes(s) &&
          !b.sectors.join(' ').toLowerCase().includes(s)
        ) return false;
      }
      if (location !== 'All Location' && !b.location.includes(location)) return false;
      if (sector   !== 'All Sectors'  && !b.sectors.some((s) => s.toLowerCase().includes(sector.toLowerCase()))) return false;
      if (verifiedOnly && !b.verified) return false;
      return true;
    });
  }, [search, location, sector, verifiedOnly]);

  const totalProjects = BUILDERS.reduce((a, b) => a + b.projects, 0);
  const totalValue    = '₹8,346 Cr+';

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-slate-50">

      {/* ── Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-brand-700 text-sm font-medium hover:text-brand-800 mb-5">
          <ArrowLeft size={15} /> Back to Home
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Discover India's Premier Builders
        </h1>
        <p className="text-slate-500 text-sm mb-5 max-w-xl">
          Connect with verified, trusted builders and developers across India. Browse portfolios,
          read reviews, and find your perfect construction partner.
        </p>

        {/* Stat chips */}
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-600 text-white">
            <CheckCircle2 size={12} /> {BUILDERS.filter((b) => b.verified).length} Verified Builders
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500 text-white">
            <TrendingUp size={12} /> {totalValue} Portfolio Value
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-green-600 text-white">
            <Briefcase size={12} /> {totalProjects}+ Projects Completed
          </span>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 sticky top-14 z-20">
        <FilterBar
          search={search}     onSearch={setSearch}
          locationOptions={LOCATIONS} location={location} onLocation={setLocation}
          sectorOptions={SECTORS}     sector={sector}     onSector={setSector}
          verifiedOnly={verifiedOnly} onVerifiedOnly={setVerifiedOnly}
          view={view}   onView={setView}
          placeholder="Search builders, companies, specializations..."
        />
      </div>

      {/* ── Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-slate-600">No builders match your filters.</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 mb-4">{filtered.length} builders found</p>
            <div className={view === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
              {visible.map((b) => <BuilderCard key={b.id} builder={b} />)}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-outline-brand px-8 py-2.5 text-sm flex items-center gap-2"
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
