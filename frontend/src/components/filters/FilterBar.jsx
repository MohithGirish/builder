/*
 * FilterBar.jsx — Reusable search and filter toolbar for directory pages.
 *
 * Renders a horizontal bar containing a text search input, optional location
 * and sector/type dropdown selects, an optional "Verified Only" checkbox
 * toggle, and a grid/list view switcher. All filter values and handlers are
 * passed as props, making this a fully controlled, stateless component. Used
 * by the Builders, Investors, and Projects directory pages.
 */
import { Search, MapPin, Tag, CheckCircle, LayoutGrid, List } from 'lucide-react';

export default function FilterBar({
  search, onSearch,
  locationOptions, location, onLocation,
  sectorOptions,   sector,   onSector,
  verifiedOnly, onVerifiedOnly,
  view, onView,
  placeholder = 'Search...',
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card px-4 py-3 flex flex-wrap items-center gap-3">

      {/* Search */}
      <div className="flex-1 min-w-[200px] relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder-slate-400"
        />
      </div>

      <div className="h-6 w-px bg-slate-100 hidden sm:block" />

      {/* Location */}
      {locationOptions && (
        <div className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-brand-400 transition-colors">
          <MapPin size={13} className="text-brand-600" />
          <select
            value={location}
            onChange={(e) => onLocation(e.target.value)}
            className="text-xs font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer appearance-none pr-4"
          >
            {locationOptions.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      )}

      {/* Sector */}
      {sectorOptions && (
        <div className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-brand-400 transition-colors">
          <Tag size={13} className="text-brand-600" />
          <select
            value={sector}
            onChange={(e) => onSector(e.target.value)}
            className="text-xs font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer appearance-none pr-4"
          >
            {sectorOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {/* Verified Only */}
      {onVerifiedOnly !== undefined && (
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => onVerifiedOnly(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${verifiedOnly ? 'bg-brand-600 border-brand-600' : 'border-slate-300 bg-white'}`}>
            {verifiedOnly && <CheckCircle size={11} className="text-white" />}
          </div>
          <span className="text-xs font-medium text-slate-600">Verified Only</span>
        </label>
      )}

      {/* View toggle */}
      {onView && (
        <div className="flex items-center gap-1 ml-auto bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => onView('grid')}
            className={`p-1.5 rounded-lg transition-all ${view === 'grid' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onView('list')}
            className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <List size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
