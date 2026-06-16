/*
 * FilterBar.jsx — Reusable search and filter toolbar for directory pages.
 *
 * Search input has a Search icon prefix (shadcn-style). Location and sector
 * dropdowns are styled consistently with rounded-xl borders. Verified-only
 * uses a pill toggle switch. Grid/List toggle uses icon buttons. All state
 * is controlled via props — this is a fully stateless, controlled component.
 */
import { Search, MapPin, Tag, LayoutGrid, List, ChevronDown } from 'lucide-react';

export default function FilterBar({
  search, onSearch,
  locationOptions, location, onLocation,
  sectorOptions,   sector,   onSector,
  verifiedOnly, onVerifiedOnly,
  view, onView,
  placeholder = 'Search...',
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 px-4 py-3 flex flex-wrap items-center gap-3">

      {/* Search — icon prefix */}
      <div className="flex-1 min-w-[180px] relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 placeholder-slate-400 transition-all"
        />
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-slate-100 hidden sm:block" />

      {/* Location */}
      {locationOptions && (
        <div className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-colors">
          <MapPin size={12} className="text-teal-600 shrink-0" />
          <select
            value={location}
            onChange={(e) => onLocation(e.target.value)}
            aria-label="Filter by location"
            className="text-xs font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer appearance-none pr-4 min-w-[80px]"
          >
            {locationOptions.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <ChevronDown size={11} className="text-slate-400 pointer-events-none absolute right-2.5" />
        </div>
      )}

      {/* Sector */}
      {sectorOptions && (
        <div className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-colors">
          <Tag size={12} className="text-teal-600 shrink-0" />
          <select
            value={sector}
            onChange={(e) => onSector(e.target.value)}
            aria-label="Filter by sector"
            className="text-xs font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer appearance-none pr-4 min-w-[80px]"
          >
            {sectorOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={11} className="text-slate-400 pointer-events-none absolute right-2.5" />
        </div>
      )}

      {/* Verified only — pill toggle switch */}
      {onVerifiedOnly !== undefined && (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          {/* Switch track */}
          <button
            type="button"
            role="switch"
            aria-checked={verifiedOnly}
            onClick={() => onVerifiedOnly(!verifiedOnly)}
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
              verifiedOnly ? 'bg-teal-600' : 'bg-slate-200'
            }`}
          >
            {/* Thumb */}
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                verifiedOnly ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Verified Only</span>
        </label>
      )}

      {/* View toggle — grid / list */}
      {onView && (
        <div className="flex items-center gap-0.5 ml-auto bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => onView('grid')}
            aria-label="Grid view"
            className={`p-1.5 rounded-lg transition-all ${
              view === 'grid' ? 'bg-white shadow-sm text-teal-700' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => onView('list')}
            aria-label="List view"
            className={`p-1.5 rounded-lg transition-all ${
              view === 'list' ? 'bg-white shadow-sm text-teal-700' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <List size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
