/*
 * ProjectDetail.jsx — Full detail page for a real estate project.
 *
 * Looks up a project from REAL_PROJECTS by URL param id and renders a rich
 * multi-tab detail view: Overview (with inline location map), Unit Types,
 * Floor Plan, Amenities, Specifications, and Location (Google Maps + nearby).
 * A sticky sidebar shows pricing with a live INR/USD/AED/GBP currency toggle,
 * developer contact, site-visit booking, and an Invest button for investors.
 * Includes a lightbox for gallery. Scrolls to the top on every project load.
 */
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useLayoutEffect, useEffect } from 'react';
import {
  MapPin, Phone, Mail, Globe, Shield, ArrowLeft, CheckCircle2,
  Building2, Layers, Clock, ChevronRight, X, ExternalLink,
  FileText,
} from 'lucide-react';
import { REAL_PROJECTS } from '../data/realProjects';
import { cachedFetch } from '../lib/api';
import NearbyGoogleMap   from '../components/map/NearbyGoogleMap';
import QuoteRequestModal from '../components/quotes/QuoteRequestModal';
import SiteVisitModal    from '../components/quotes/SiteVisitModal';
import CurrencySelector  from '../components/project/CurrencySelector';

/* ── Currency conversion helpers ─────────────────────────────────────────── */

function parseInrAmount(token) {
  const s = token.replace(/₹/, '').replace(/,/g, '').trim();
  if (/Cr$/i.test(s))   return parseFloat(s) * 1e7;
  if (/Lakh$/i.test(s)) return parseFloat(s) * 1e5;
  return parseFloat(s) || 0;
}

function formatConverted(amount, currency) {
  const symbol = { USD: '$', AED: 'AED ', GBP: '£' }[currency] || '';
  if (amount >= 1_000_000)  return `${symbol}${(amount / 1_000_000).toFixed(2)} M`;
  if (amount >= 1_000)      return `${symbol}${Math.round(amount).toLocaleString('en-US')}`;
  return `${symbol}${amount.toFixed(0)}`;
}

function convertPriceString(priceRange, currency, rates) {
  if (!priceRange || /^(on request|available on request)$/i.test(priceRange.trim())) {
    return priceRange;
  }
  if (currency === 'INR' || !rates || !rates[currency]) return priceRange;
  const rate = rates[currency];
  return priceRange.replace(/₹([\d,]+(?:\.\d+)?)(\s*(?:Cr|Lakh))?/gi, (_, num, suffix) => {
    const amount = parseInrAmount('₹' + num + (suffix || ''));
    return formatConverted(amount * rate, currency);
  });
}

const SESSION_KEY = 'builderai_currency';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [lightbox, setLightbox] = useState(null);
  const [showQuote,     setShowQuote]     = useState(false);
  const [showVisit,     setShowVisit]     = useState(false);

  /* ── FX rates state ────────────────────────────────────────────────────── */
  const [currency,   setCurrency]   = useState(() => sessionStorage.getItem(SESSION_KEY) || 'INR');
  const [fxRates,    setFxRates]    = useState(null);
  const [fxUpdated,  setFxUpdated]  = useState(null);
  const [fxFallback, setFxFallback] = useState(false);

  useEffect(() => {
    // FX rates change at most every 2h server-side; cache client-side for 5min
    // so opening multiple projects doesn't refetch on every mount.
    cachedFetch('/api/v1/fx/rates', {}, { ttl: 5 * 60 * 1000 })
      .then(json => {
        if (json?.success) {
          setFxRates(json.data.rates);
          setFxUpdated(json.data.updatedAt);
          setFxFallback(json.data.source === 'fallback');
        }
      })
      .catch(() => {});
  }, []);

  function handleCurrencyChange(code) {
    setCurrency(code);
    sessionStorage.setItem(SESSION_KEY, code);
  }

  /* Scroll to top whenever the project id changes — runs before paint */
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const project = REAL_PROJECTS.find(p => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 px-4">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-slate-100">
          <Building2 size={36} className="text-slate-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Project Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">The project you're looking for doesn't exist or may have moved.</p>
          <Link to="/" className="btn-brand px-6 py-2.5 text-sm">Back to Home</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'specs', label: 'Specifications' },
    { id: 'location', label: 'Location' },
  ];

  if (project.sections.floorBreakdown) tabs.splice(1, 0, { id: 'floors', label: 'Floor Plan' });
  if (project.sections.unitTypes) tabs.splice(1, 0, { id: 'units', label: 'Unit Types' });
  if (project.images?.length) tabs.splice(1, 0, { id: 'gallery', label: 'Gallery' });

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative h-[55vh] min-h-[380px] overflow-hidden">
        <img
          src={project.heroImage}
          alt={project.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)' }} />
        <div className="absolute inset-0" style={{ background: project.gradient, opacity: 0.55 }} />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-5 flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-7xl mx-auto">
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
            style={{ background: project.color + 'cc', color: 'white' }}
          >
            {project.type}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-2 leading-tight">
            {project.name}
          </h1>
          <p className="text-white/80 text-base sm:text-lg mb-4">{project.tagline}</p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-white/90 text-sm">
              <MapPin size={14} className="shrink-0" />
              {project.fullAddress}
            </div>
            {project.rera && project.rera !== 'Available on Request' && (
              <div className="flex items-center gap-1.5 text-white/80 text-xs">
                <Shield size={12} className="shrink-0" />
                RERA: {project.rera}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick stats bar ────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-[64px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative">
            <div className="flex items-center gap-6 py-3 overflow-x-auto no-scrollbar">
              {project.highlights.map(h => (
                <div key={h.label} className="flex flex-col items-center shrink-0 px-4 border-r border-slate-100 last:border-0">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">{h.label}</span>
                  <span className="text-sm font-bold text-slate-800 whitespace-nowrap">{h.value}</span>
                </div>
              ))}
            </div>
            {/* Scroll hint: right fade */}
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden" />
          </div>
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 grid lg:grid-cols-[1fr_320px] gap-8">

        {/* ── Left: Tabs content ─────────────────────────────────── */}
        <div className="min-w-0">
          {/* Tab nav */}
          <div className="relative mb-6">
            <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
                    ${activeTab === t.id ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  style={activeTab === t.id ? { background: project.gradient } : {}}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {/* Scroll hint: right fade — visible only when tabs overflow on small screens */}
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent rounded-r-2xl pointer-events-none sm:hidden" />
          </div>

          {/* Tab content */}
          <div key={activeTab} className="animate-fade-in">

          {/* ── Overview tab ────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-3">About the Project</h2>
                <p className="text-slate-600 leading-relaxed text-sm">{project.description}</p>
              </div>

              {/* Highlights grid */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Project Highlights</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {project.highlights.map(h => (
                    <div key={h.label} className="rounded-xl p-3 border border-slate-100" style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1">{h.label}</p>
                      <p className="text-sm font-bold text-slate-800">{h.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick facts */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Facts</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Developer', value: project.developer },
                    { label: 'Price Range', value: project.priceRange },
                    { label: 'Possession', value: project.possession },
                    ...(project.landArea ? [{ label: 'Land Area', value: project.landArea }] : []),
                    ...(project.towers ? [{ label: 'Towers', value: project.towers }] : []),
                    ...(project.totalUnits ? [{ label: 'Total Units', value: project.totalUnits }] : []),
                    ...(project.unitSizes ? [{ label: 'Unit Sizes', value: project.unitSizes }] : []),
                    ...(project.totalOfficeArea ? [{ label: 'Office Area', value: project.totalOfficeArea }] : []),
                    ...(project.coworkingArea ? [{ label: 'Co-Working Area', value: project.coworkingArea }] : []),
                    ...(project.officeSizes ? [{ label: 'Office Sizes', value: project.officeSizes }] : []),
                    ...(project.rera ? [{ label: 'RERA No.', value: project.rera }] : []),
                  ].filter(f => f.value && f.value !== 'Available on Request').map(f => (
                    <div key={f.label} className="flex items-start justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide shrink-0">{f.label}</span>
                      <span className="text-xs text-slate-700 font-semibold text-right">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Location map (inline on Overview) ──────────── */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-2">Property Location</h2>
                <p className="text-slate-500 text-sm mb-4">{project.fullAddress}</p>
                <div className="rounded-xl overflow-hidden border border-slate-100 h-56 mb-4">
                  <iframe
                    title={`${project.name} location overview`}
                    width="100%"
                    height="100%"
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${project.coordinates[1] - 0.02},${project.coordinates[0] - 0.015},${project.coordinates[1] + 0.02},${project.coordinates[0] + 0.015}&layer=mapnik&marker=${project.coordinates[0]},${project.coordinates[1]}`}
                    style={{ border: 0 }}
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${project.coordinates[0]},${project.coordinates[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-semibold hover:underline"
                  style={{ color: project.color }}
                >
                  Open in Google Maps <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}

          {/* ── Gallery tab ─────────────────────────────────────── */}
          {activeTab === 'gallery' && project.images?.length && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-5">Project Gallery</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {project.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox(i)}
                    className="relative group rounded-xl overflow-hidden aspect-video focus:outline-none ring-0 focus:ring-2 focus:ring-offset-2 transition-all"
                    style={{ '--tw-ring-color': project.color }}
                  >
                    <img
                      src={img.src}
                      alt={img.caption || `${project.name} render ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all duration-300 flex items-end p-3">
                      {img.caption && (
                        <p className="text-white text-xs font-semibold leading-snug opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-left drop-shadow">
                          {img.caption}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Unit types tab ──────────────────────────────────── */}
          {activeTab === 'units' && project.sections.unitTypes && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-5">Available Unit Types</h2>
              <div className="space-y-4">
                {project.sections.unitTypes.map((u, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-100 p-5 hover:border-slate-200 transition-colors"
                    style={{ background: 'linear-gradient(135deg, #f8fafc, #ffffff)' }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full text-white"
                        style={{ background: project.gradient }}
                      >
                        {u.type}
                      </span>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">Facing</p>
                        <p className="text-sm font-bold text-slate-700">{u.facing}</p>
                        {u.block && <p className="text-[10px] text-slate-400 mt-0.5">{u.block}</p>}
                      </div>
                    </div>
                    <div className="flex gap-6 flex-wrap mb-3">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">Size</p>
                        <p className="text-sm font-bold text-slate-800">{u.builtUp}</p>
                      </div>
                      {u.superBuiltUp && (
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Super Built-up</p>
                          <p className="text-sm font-bold text-slate-800">{u.superBuiltUp}</p>
                        </div>
                      )}
                    </div>
                    {(u.bedrooms || u.bathrooms || u.maidRooms || u.parking) && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {[u.bedrooms, u.bathrooms, u.maidRooms, u.parking].filter(Boolean).map(spec => (
                          <span
                            key={spec}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                            style={{ background: project.color + '18', color: project.color }}
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                    {u.features && (
                      <p className="text-[11px] text-slate-500 leading-relaxed">{u.features}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Floor plan tab ──────────────────────────────────── */}
          {activeTab === 'floors' && project.sections.floorBreakdown && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-5">Floor Distribution</h2>
              <div className="space-y-2">
                {[...project.sections.floorBreakdown].reverse().map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-xl p-4 transition-all hover:shadow-sm"
                    style={{
                      background: i === 0
                        ? project.gradient
                        : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                      border: '1px solid transparent',
                    }}
                  >
                    <div
                      className="w-24 shrink-0 text-center py-1 rounded-lg text-xs font-bold"
                      style={{
                        background: i === 0 ? 'rgba(255,255,255,0.2)' : project.color + '22',
                        color: i === 0 ? 'white' : project.color,
                      }}
                    >
                      {f.floors}
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight size={14} style={{ color: i === 0 ? 'rgba(255,255,255,0.7)' : '#94a3b8' }} />
                      <p className={`text-sm font-semibold ${i === 0 ? 'text-white' : 'text-slate-700'}`}>{f.use}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Amenities tab ───────────────────────────────────── */}
          {activeTab === 'amenities' && (
            <div className="space-y-4">
              {project.sections.amenities.map(group => (
                <div key={group.category} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-1 h-5 rounded-full"
                      style={{ background: project.gradient }}
                    />
                    <h3 className="font-bold text-slate-800">{group.category}</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {group.items.map(item => (
                      <div key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 size={13} className="shrink-0 mt-0.5" style={{ color: project.color }} />
                        <span className="text-sm text-slate-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Specifications tab ──────────────────────────────── */}
          {activeTab === 'specs' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-5">Technical Specifications</h2>
              <div className="divide-y divide-slate-50">
                {project.sections.specifications.map((spec, i) => (
                  <div key={i} className="flex gap-4 py-3.5 items-start">
                    <div className="w-40 shrink-0">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{spec.label}</span>
                    </div>
                    <p className="text-sm text-slate-700 flex-1">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Location tab ────────────────────────────────────── */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-1">Nearby Places & Distances</h2>
                <p className="text-slate-500 text-sm mb-5">
                  Click any place to view the driving route from {project.name}.
                </p>
                <NearbyGoogleMap project={project} />
              </div>
            </div>
          )}
          </div>
        </div>

        {/* ── Right: Sticky sidebar ─────────────────────────────── */}
        <div className="space-y-4 min-w-0">

          {/* Price card */}
          <div
            className="rounded-2xl p-6 text-white shadow-lg"
            style={{ background: project.gradient }}
          >
            <CurrencySelector
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              rates={fxRates}
              updatedAt={fxUpdated}
              fallback={fxFallback}
              projectGradient={project.gradient}
            />
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Price Range</p>
            {currency === 'INR' || !fxRates ? (
              <p className="text-2xl font-extrabold mb-4">{project.priceRange}</p>
            ) : (
              <div className="mb-4">
                <p className="text-2xl font-extrabold leading-snug">
                  {convertPriceString(project.priceRange, currency, fxRates)}
                </p>
                {/* Keep original ₹ figure visible */}
                <p className="text-sm text-white/60 mt-1">{project.priceRange}</p>
              </div>
            )}
            <div className="space-y-2 border-t border-white/20 pt-4">
              {[
                { icon: Clock, label: 'Possession', value: project.possession },
                { icon: MapPin, label: 'Location', value: project.location },
                ...(project.rera && project.rera !== 'Available on Request'
                  ? [{ icon: Shield, label: 'RERA', value: project.rera }]
                  : []),
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <Icon size={13} className="text-white/60 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-white/60 uppercase tracking-wide">{label}</p>
                    <p className="text-xs text-white font-semibold">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 text-sm">Contact Developer</h3>
            <div className="space-y-3 mb-4">
              {project.phone && (
                <a
                  href={`tel:${project.phone}`}
                  className="flex items-center gap-3 py-2.5 px-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors text-sm"
                >
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <span className="text-slate-700 font-medium">{project.phone}</span>
                </a>
              )}
              {project.email && (
                <a
                  href={`mailto:${project.email}`}
                  className="flex items-center gap-3 py-2.5 px-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors text-sm"
                >
                  <Mail size={14} className="text-slate-400 shrink-0" />
                  <span className="text-slate-700 font-medium truncate">{project.email}</span>
                </a>
              )}
              {project.website && (
                <a
                  href={`https://${project.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 py-2.5 px-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors text-sm"
                >
                  <Globe size={14} className="text-slate-400 shrink-0" />
                  <span className="font-medium truncate" style={{ color: project.color }}>{project.website}</span>
                </a>
              )}
            </div>

            <button
              onClick={() => setShowVisit(true)}
              className="w-full py-3 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: project.gradient }}
            >
              Schedule Site Visit
            </button>

            <button
              onClick={() => setShowQuote(true)}
              className="w-full mt-3 py-3 rounded-xl text-sm font-bold border-2 transition-colors hover:bg-slate-50 flex items-center justify-center gap-2"
              style={{ borderColor: project.color, color: project.color }}
            >
              <FileText size={15} />
              Request Quote
            </button>
          </div>

          {/* Developer card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0"
                style={{ background: project.gradient }}
              >
                {project.developer?.charAt(0) || 'D'}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Developer</p>
                <p className="text-sm font-bold text-slate-800 leading-tight">{project.developer}</p>
              </div>
            </div>
            {project.rera && project.rera !== 'Available on Request' && (
              <div className="flex items-center gap-2 mt-3 bg-green-50 rounded-xl px-3 py-2">
                <Shield size={12} className="text-green-600 shrink-0" />
                <p className="text-[10px] font-semibold text-green-700">RERA Registered</p>
              </div>
            )}
          </div>

          {/* View all projects */}
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 text-sm font-semibold hover:border-slate-300 hover:text-slate-700 transition-all"
          >
            <Layers size={14} />
            View All Projects
          </Link>
        </div>
      </div>

      {/* ── Quote request modal ──────────────────────────────────── */}
      {showQuote && (
        <QuoteRequestModal project={project} onClose={() => setShowQuote(false)} />
      )}

      {/* ── Site visit modal ─────────────────────────────────────── */}
      {showVisit && (
        <SiteVisitModal project={project} onClose={() => setShowVisit(false)} />
      )}

      {/* ── Lightbox overlay ─────────────────────────────────────── */}
      {lightbox !== null && project.images?.length && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close image viewer"
            className="absolute top-2 right-2 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>

          {lightbox > 0 && (
            <button
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-colors text-3xl font-bold"
              onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }}
            >
              ‹
            </button>
          )}

          <div
            className="max-w-5xl w-full flex flex-col items-center gap-3"
            onClick={e => e.stopPropagation()}
          >
            <img
              key={lightbox}
              src={project.images[lightbox].src}
              alt={project.images[lightbox].caption || project.name}
              className="max-h-[80vh] w-full object-contain rounded-xl shadow-2xl animate-scale-in"
            />
            {project.images[lightbox].caption && (
              <p className="text-white/80 text-sm text-center font-medium">
                {project.images[lightbox].caption}
              </p>
            )}
            <p className="text-white/40 text-xs">{lightbox + 1} / {project.images.length}</p>
          </div>

          {lightbox < project.images.length - 1 && (
            <button
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-colors text-3xl font-bold"
              onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
