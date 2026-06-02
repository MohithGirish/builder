/*
 * NearbyGoogleMap.jsx — Interactive nearby-places explorer for a project detail page.
 *
 * Renders a clickable list of nearby locations. Selecting a place shows distance +
 * drive-time summary cards, a live Google Maps embed switching to directions mode
 * for that route, and a deep-link button to open the full route in a new tab.
 * When no place is selected the embed shows the property's location (place mode).
 * Without VITE_GOOGLE_MAPS_API_KEY the embed is hidden and only the deep-link button
 * is shown when a place is selected.
 */
import { useState } from 'react';
import { Clock, Navigation, Route, X, MapPin, ExternalLink, Car } from 'lucide-react';

const NEARBY_COLORS = {
  Transport:  'bg-blue-50 text-blue-700 border-blue-100',
  Commercial: 'bg-amber-50 text-amber-700 border-amber-100',
  Education:  'bg-violet-50 text-violet-700 border-violet-100',
  Healthcare: 'bg-red-50 text-red-700 border-red-100',
  Leisure:    'bg-green-50 text-green-700 border-green-100',
  Landmark:   'bg-orange-50 text-orange-700 border-orange-100',
  Area:       'bg-slate-100 text-slate-600 border-slate-200',
};

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export default function NearbyGoogleMap({ project }) {
  const [selected, setSelected] = useState(null);
  const [lat, lng] = project.coordinates;

  function toggle(n) {
    setSelected(prev => (prev?.place === n.place ? null : n));
  }

  const nearby = project.sections.nearby;

  /* Deep-link: opens Google Maps directions in a new tab (no API key needed) */
  const directionsUrl = selected
    ? `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${encodeURIComponent(selected.place + ', Hyderabad, India')}&travelmode=driving`
    : null;

  /* Embed: directions when a place is selected, property location otherwise.
     &region=in biases geocoding to India, fixing the world-view bug. */
  const embedSrc = GOOGLE_KEY
    ? selected
      ? `https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_KEY}&origin=${lat},${lng}&destination=${encodeURIComponent(selected.place + ', Hyderabad, India')}&mode=driving&region=in&language=en`
      : `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_KEY}&q=${lat},${lng}&zoom=15`
    : null;

  return (
    <div className="space-y-4">

      {/* ── Route panel (visible only when a place is selected) ──── */}
      {selected ? (
        <div className="space-y-3">

          {/* Route header */}
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <Navigation size={13} className="text-blue-600 shrink-0" />
              <span className="font-semibold text-blue-800 truncate">{project.name}</span>
              <span className="text-blue-400 shrink-0">→</span>
              <span className="font-semibold text-blue-700 truncate">{selected.place}</span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="shrink-0 text-blue-400 hover:text-blue-600 transition-colors"
              aria-label="Clear route"
            >
              <X size={14} />
            </button>
          </div>

          {/* Distance + time stat cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: project.color + '18' }}
              >
                <Route size={14} style={{ color: project.color }} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Distance</p>
                <p className="text-base font-extrabold text-slate-800">{selected.distance}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: project.color + '18' }}
              >
                <Clock size={14} style={{ color: project.color }} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Drive Time</p>
                <p className="text-base font-extrabold text-slate-800">{selected.time}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── No selection prompt ─────────────────────────────────── */
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
          <Navigation size={14} className="text-slate-400 shrink-0" />
          <p className="text-sm text-slate-500">
            Click any place below to view the driving route from{' '}
            <strong className="text-slate-700">{project.name}</strong>.
          </p>
        </div>
      )}

      {/* ── Embedded map — directions when selected, property pin otherwise ── */}
      {embedSrc && (
        <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm" style={{ height: 260 }}>
          <iframe
            key={embedSrc}
            title={selected ? `Route to ${selected.place}` : `Location of ${project.name}`}
            src={embedSrc}
            width="100%"
            height="100%"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0 }}
          />
        </div>
      )}

      {/* ── Open in Google Maps (shown when a place is selected) ─── */}
      {selected && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 shadow-sm"
          style={{ background: project.gradient }}
        >
          <Car size={14} />
          Open Route in Google Maps
          <ExternalLink size={12} />
        </a>
      )}

      {/* ── Nearby list ─────────────────────────────────────────── */}
      <div className="space-y-2">
        {nearby.map((n, i) => {
          const isActive = selected?.place === n.place;
          const colorCls = NEARBY_COLORS[n.category] || 'bg-slate-100 text-slate-600 border-slate-200';
          return (
            <button
              key={i}
              onClick={() => toggle(n)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-all
                ${isActive
                  ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200 shadow-sm'
                  : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200'}`}
            >
              {/* Left: dot + name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 transition-all ${isActive ? 'scale-125' : ''}`}
                  style={{ background: project.color }}
                />
                <span className={`text-sm truncate ${isActive ? 'text-blue-700 font-semibold' : 'text-slate-700'}`}>
                  {n.place}
                </span>
              </div>

              {/* Right: category + distance + time */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colorCls}`}>
                  {n.category}
                </span>
                {n.distance && (
                  <span className="flex items-center gap-0.5 text-[11px] font-bold text-slate-500">
                    <Route size={10} />
                    {n.distance}
                  </span>
                )}
                <span className="flex items-center gap-0.5 text-[11px] font-bold text-slate-400">
                  <Clock size={10} />
                  {n.time}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Open property location in Google Maps ───────────────── */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-semibold hover:underline pt-1"
        style={{ color: project.color }}
      >
        <MapPin size={11} />
        Open property location in Google Maps
      </a>
    </div>
  );
}
