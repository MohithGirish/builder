/*
 * ProjectsMap.jsx — Interactive Leaflet map displaying real Hyderabad projects.
 *
 * Renders a react-leaflet MapContainer with OpenStreetMap tiles and custom SVG
 * pin markers for each project in REAL_PROJECTS, colour-coded by project type.
 * Each pin opens a popup card with project name, type, location, price, and a
 * "View Project Details" button. Auth-aware navigation: authenticated+onboarded
 * users go directly to /projects/:id; others are redirected to login with the
 * destination stored in sessionStorage. Fixes Leaflet default icon paths for Vite.
 */
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { REAL_PROJECTS } from '../../data/realProjects';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon paths broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createCustomIcon(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
    <filter id="shadow" x="-30%" y="-20%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26S32 28 32 16C32 7.16 24.84 0 16 0z"
      fill="${color}" filter="url(#shadow)"/>
    <circle cx="16" cy="16" r="7" fill="white" opacity="0.9"/>
    <circle cx="16" cy="16" r="4" fill="${color}"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -44],
  });
}

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    const bounds = REAL_PROJECTS.map(p => p.coordinates);
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [map]);
  return null;
}

export default function ProjectsMap() {
  const navigate = useNavigate();
  const { isAuthenticated, onboardingComplete } = useAuth();

  function handleViewProject(projectId) {
    if (isAuthenticated && onboardingComplete) {
      navigate(`/projects/${projectId}`);
    } else {
      sessionStorage.setItem('builderai_redirect', `/projects/${projectId}`);
      navigate('/login', { state: { from: { pathname: `/projects/${projectId}` } } });
    }
  }

  return (
    <div className="w-full h-[420px] rounded-2xl overflow-hidden shadow-xl border border-slate-200">
      <MapContainer
        center={[17.4, 78.35]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds />

        {REAL_PROJECTS.map((project) => (
          <Marker
            key={project.id}
            position={project.coordinates}
            icon={createCustomIcon(project.color)}
          >
            <Popup
              minWidth={220}
              className="project-map-popup"
              closeButton={false}
            >
              <div style={{ fontFamily: 'system-ui, sans-serif' }}>
                <div
                  className="px-3 py-2 rounded-t-lg -mx-1 -mt-1 mb-2"
                  style={{ background: project.gradient }}
                >
                  <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>
                    {project.type}
                  </p>
                  <p style={{ color: 'white', fontSize: 14, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                    {project.name}
                  </p>
                </div>

                <div style={{ padding: '0 2px' }}>
                  <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 4px 0' }}>
                    📍 {project.location}
                  </p>
                  <p style={{ color: '#374151', fontSize: 11, fontWeight: 600, margin: '0 0 8px 0' }}>
                    {project.priceRange}
                  </p>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {project.highlights.slice(0, 2).map(h => (
                      <span key={h.label} style={{
                        fontSize: 10, background: '#f1f5f9', color: '#475569',
                        borderRadius: 6, padding: '2px 7px', fontWeight: 600,
                      }}>
                        {h.label}: {h.value}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleViewProject(project.id)}
                    style={{
                      width: '100%', padding: '7px 12px', borderRadius: 8,
                      border: 'none', cursor: 'pointer', fontSize: 12,
                      fontWeight: 700, color: 'white', background: project.gradient,
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => e.target.style.opacity = '0.88'}
                    onMouseLeave={e => e.target.style.opacity = '1'}
                  >
                    View Project Details →
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
