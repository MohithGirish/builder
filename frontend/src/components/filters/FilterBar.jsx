/*
 * FilterBar.jsx — Reusable search and filter toolbar for directory pages.
 *
 * Search input has a Search icon prefix. Location and sector filters use a
 * custom FilterSelect listbox (replaces native <select>) so the open panel
 * and selected-item highlight match the Blueprint Index design system.
 * Verified-only uses a pill toggle. Grid/List toggle uses icon buttons.
 * All state is controlled via props — fully stateless, controlled component.
 */
import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Tag, LayoutGrid, List, ChevronDown, Check } from 'lucide-react';

/* Custom dropdown — replaces native <select> to allow full panel styling */
function FilterSelect({ icon: Icon, value, options, onChange, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={[
          'flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border text-xs font-medium text-slate-700 transition-all',
          open
            ? 'border-brand-400 ring-2 ring-brand-100'
            : 'border-slate-200 hover:border-brand-300',
        ].join(' ')}
      >
        {Icon && <Icon size={12} className="text-brand-600 shrink-0" />}
        <span className="min-w-[80px] text-left">{value}</span>
        <ChevronDown
          size={11}
          className={`text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute top-full left-0 mt-1.5 z-50 min-w-[168px] bg-white border border-slate-200 rounded-xl shadow-lg py-1 overflow-hidden"
        >
          {options.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={opt === value}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={[
                'flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-colors',
                opt === value
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50',
              ].join(' ')}
            >
              <span className="w-3 shrink-0 flex items-center">
                {opt === value && <Check size={11} className="text-brand-600" />}
              </span>
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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

      {/* Search */}
      <div className="flex-1 min-w-[180px] relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400 placeholder-slate-400 transition-all"
        />
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-slate-100 hidden sm:block" />

      {/* Location */}
      {locationOptions && (
        <FilterSelect
          icon={MapPin}
          value={location}
          options={locationOptions}
          onChange={onLocation}
          ariaLabel="Filter by location"
        />
      )}

      {/* Sector */}
      {sectorOptions && (
        <FilterSelect
          icon={Tag}
          value={sector}
          options={sectorOptions}
          onChange={onSector}
          ariaLabel="Filter by sector"
        />
      )}

      {/* Verified only */}
      {onVerifiedOnly !== undefined && (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={verifiedOnly}
            onClick={() => onVerifiedOnly(!verifiedOnly)}
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
              verifiedOnly ? 'bg-brand-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                verifiedOnly ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Verified Only</span>
        </label>
      )}

      {/* View toggle */}
      {onView && (
        <div className="flex items-center gap-0.5 ml-auto bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => onView('grid')}
            aria-label="Grid view"
            className={`p-1.5 rounded-lg transition-all ${
              view === 'grid' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => onView('list')}
            aria-label="List view"
            className={`p-1.5 rounded-lg transition-all ${
              view === 'list' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <List size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
