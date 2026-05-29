/*
 * Investors.jsx — Public investors directory page.
 *
 * Renders a searchable and filterable list of verified investors with location,
 * investor-type, and verified-only filters plus grid/list view toggle and
 * infinite-load pagination. Displays summary stat chips (verified count, total
 * portfolio, active investments) above the filter bar. Filters are computed
 * client-side via useMemo against the static INVESTORS dataset.
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, BarChart2, DollarSign, ChevronDown } from 'lucide-react';
import InvestorCard from '../components/cards/InvestorCard';
import FilterBar    from '../components/filters/FilterBar';
import { INVESTORS, INVESTOR_TYPES, INV_LOCATIONS } from '../data/investors';

const PAGE_SIZE = 6;

export default function Investors() {
  const [search,      setSearch]      = useState('');
  const [location,    setLocation]    = useState('All Location');
  const [type,        setType]        = useState('All Types');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [view,        setView]        = useState('grid');
  const [page,        setPage]        = useState(1);

  const filtered = useMemo(() => {
    return INVESTORS.filter((inv) => {
      if (search) {
        const s = search.toLowerCase();
        if (
          !inv.name.toLowerCase().includes(s) &&
          !inv.type.toLowerCase().includes(s) &&
          !inv.location.toLowerCase().includes(s) &&
          !inv.sectors.join(' ').toLowerCase().includes(s)
        ) return false;
      }
      if (location !== 'All Location' && !inv.location.includes(location)) return false;
      if (type !== 'All Types' && !inv.type.toLowerCase().includes(type.toLowerCase())) return false;
      if (verifiedOnly && !inv.verified) return false;
      return true;
    });
  }, [search, location, type, verifiedOnly]);

  const totalPortfolio = '₹9,520 Cr+';
  const totalActive    = INVESTORS.reduce((a, i) => a + i.activeInvestments, 0);

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
          Connect with Leading Investors
        </h1>
        <p className="text-slate-500 text-sm mb-5 max-w-xl">
          Find verified investors, VC firms, PE funds, and angel networks actively seeking
          real-estate and infrastructure opportunities across India.
        </p>

        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-600 text-white">
            <CheckCircle2 size={12} /> {INVESTORS.filter((i) => i.verified).length} Verified Investors
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500 text-white">
            <BarChart2 size={12} /> {totalPortfolio} Total Portfolio
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-green-600 text-white">
            <DollarSign size={12} /> {totalActive}+ Active Investments
          </span>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 sticky top-14 z-20">
        <FilterBar
          search={search}     onSearch={setSearch}
          locationOptions={INV_LOCATIONS} location={location} onLocation={setLocation}
          sectorOptions={INVESTOR_TYPES}  sector={type}       onSector={setType}
          verifiedOnly={verifiedOnly} onVerifiedOnly={setVerifiedOnly}
          view={view}   onView={setView}
          placeholder="Search investors, firms, specializations..."
        />
      </div>

      {/* ── Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-slate-600">No investors match your filters.</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 mb-4">{filtered.length} investors found</p>
            <div className={view === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
              {visible.map((inv) => <InvestorCard key={inv.id} investor={inv} />)}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-outline-brand px-8 py-2.5 text-sm flex items-center gap-2"
                >
                  Load More Investors <ChevronDown size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
