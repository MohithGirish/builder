/*
 * LocationsMap.jsx — Profile map of a set of locations (Google iframe embed).
 *
 * Takes a list of `{ key, label, query }` items and renders them as clickable
 * chips that focus a single Google Maps iframe embed (place mode, India-biased)
 * on the selected item's `query` (a place string or "lat,lng"). Used for an
 * investor's target regions and a builder's listed-project locations. Reuses the
 * existing VITE_GOOGLE_MAPS_API_KEY embed integration (same as NearbyGoogleMap) —
 * no JS maps loader. Empty list → default India view + message; no key → deep-link.
 *
 * ponytail: the Google Embed API can't render multiple markers or fitBounds to a
 * custom set, so chips represent the set and the map shows one item at a time.
 * Upgrade path: add the JS Maps API loader only if true multi-point bounds are needed.
 */
import { useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export default function LocationsMap({ title, subtitle, emptyText, items = [] }) {
  const [selected, setSelected] = useState(0);
  const active = items[selected] || null;

  /* Embed: the selected item in place mode, or a default India view when none.
     &region=in biases geocoding to India. */
  const embedSrc = GOOGLE_KEY
    ? active
      ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_KEY}&q=${encodeURIComponent(active.query)}&region=in&language=en`
      : `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_KEY}&center=22.5,79&zoom=4&maptype=roadmap`
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <MapPin size={14} className="text-teal-600" />
          {title}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {items.length > 0 ? subtitle : emptyText}
        </p>
      </div>

      {/* Chips (the full set) */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {items.map((item, i) => (
            <button
              key={item.key ?? item.label}
              onClick={() => setSelected(i)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors
                ${i === selected
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              <MapPin size={11} />
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Map embed — or deep-link fallback when no API key is configured */}
      {embedSrc ? (
        <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex-1" style={{ minHeight: 420 }}>
          <iframe
            key={embedSrc}
            title={active ? `Map of ${active.label}` : 'Map of India'}
            src={embedSrc}
            width="100%"
            height="100%"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0 }}
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10">
          <MapPin size={28} className="text-slate-300 mb-2" />
          <p className="text-sm text-slate-500 mb-3">Map preview unavailable.</p>
          {active && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(active.query)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
            >
              Open {active.label} in Google Maps <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
