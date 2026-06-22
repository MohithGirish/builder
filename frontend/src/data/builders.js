/*
 * builders.js — Static mock dataset for the builders directory.
 *
 * Exports BUILDERS (project-centric rows — one per project), UNIQUE_BUILDERS
 * (rows grouped by builder name, each with a nested projects[] array),
 * getBuilderById, TOTAL_PROJECTS/PORTFOLIO_VALUE header stats, SECTORS (filter
 * options), and LOCATIONS (city options). The directory and Home discover render
 * UNIQUE_BUILDERS; BuildersFeed still uses the raw BUILDERS rows.
 */
export const BUILDERS = [
  {
    id: 'b-one-downtown',
    projectId: 'one-downtown',
    initials: 'RR',
    name: 'RR Corp & e-Infra',
    company: 'One Downtown — Premium Business Hub',
    location: 'Kokapet, Hyderabad',
    rating: 4.8,
    projects: 6,
    totalValue: '₹3,500 Cr+',
    sectors: ['Commercial', 'Mixed-use', 'Tech Parks'],
    verified: true,
    image: '/images/one-downtown/gallery-02.png',
  },
  {
    id: 'b-elegant-nivasa',
    projectId: 'elegant-nivasa',
    initials: 'EI',
    name: 'e-Infra',
    company: 'Elegant Nivasa — High Rise Residences',
    location: 'Kollur, Hyderabad',
    rating: 4.7,
    projects: 8,
    totalValue: '₹2,800 Cr+',
    sectors: ['Residential', 'Green Buildings'],
    verified: true,
    image: '/images/elegant-nivasa/gallery-01.png',
  },
  {
    id: 'b-la-casa',
    projectId: 'la-casa',
    initials: 'EI',
    name: 'e-Infra',
    company: 'La Casa — Luxury Villa Community',
    location: 'Adibatla, Hyderabad',
    rating: 4.6,
    projects: 4,
    totalValue: '₹600 Cr+',
    sectors: ['Residential', 'Green Buildings'],
    verified: true,
    image: '/images/la-casa/gallery-06.png',
  },
  {
    id: 'b-skyven',
    projectId: 'skyven-kokapet',
    initials: 'ES',
    name: 'e-Infra & SVR Pingle',
    company: 'Skyven — Ultra-Luxury Skyscraper',
    location: 'Kokapet, Hyderabad',
    rating: 4.9,
    projects: 5,
    totalValue: '₹4,200 Cr+',
    sectors: ['Residential', 'Mixed-use'],
    verified: true,
    image: '/images/skyven-kokapet/gallery-01.png',
  },
  {
    id: 'b-moonglade',
    projectId: 'moonglade',
    initials: 'EI',
    name: 'E-Infra IRA Ventures',
    company: 'Moonglade — Luxury Residential Township',
    location: 'Kokapet, Hyderabad',
    rating: 4.8,
    projects: 7,
    totalValue: '₹5,000 Cr+',
    sectors: ['Residential', 'Smart Cities'],
    verified: true,
    image: '/images/moonglade/gallery-14.png',
  },
];

/* ── Unique builders (deduped by name) ─────────────────────────────────────────
 * The rows above are project-centric (one row per project), so the same builder
 * can appear more than once. The directory shows one card per builder, so we
 * group by name and nest each builder's projects under it. totalValue is the
 * sum of the builder's project values; projects is the list to show on detail.
 */
const slugify    = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const crToNumber = (v) => Number(String(v).replace(/[^0-9.]/g, '')) || 0;
const formatCr   = (n) => `₹${n.toLocaleString('en-IN')} Cr+`;

export const UNIQUE_BUILDERS = (() => {
  const byName = new Map();
  for (const row of BUILDERS) {
    if (!byName.has(row.name)) {
      byName.set(row.name, {
        id:       slugify(row.name),
        name:     row.name,
        location: row.location,
        verified: false,
        sectors:  [],
        projects: [],
        _value:   0,
      });
    }
    const b = byName.get(row.name);
    b.verified = b.verified || row.verified;
    for (const s of row.sectors) if (!b.sectors.includes(s)) b.sectors.push(s);
    b._value += crToNumber(row.totalValue);
    b.projects.push({
      projectId:  row.projectId,
      name:       row.company,
      location:   row.location,
      totalValue: row.totalValue,
      sectors:    row.sectors,
      image:      row.image,
    });
  }
  // backdrop = one of the builder's own project images. Each project belongs to
  // exactly one builder, so picking the first project's image is unique per card.
  return [...byName.values()].map(({ _value, ...b }) => ({
    ...b,
    totalValue: formatCr(_value),
    backdrop:   b.projects[0]?.image || null,
  }));
})();

export const getBuilderById = (id) => UNIQUE_BUILDERS.find((b) => b.id === id);

// Avatar initials from real words only — skips connectors like "&" whose glyph
// reads as a different font in an avatar bubble.
export const initialsOf = (name) =>
  (name || '?')
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

// Directory header stats — derived so they stay in sync with the data above.
export const TOTAL_PROJECTS  = BUILDERS.length;
export const PORTFOLIO_VALUE = formatCr(BUILDERS.reduce((a, r) => a + crToNumber(r.totalValue), 0));

export const SECTORS = [
  'All Sectors', 'Residential', 'Commercial', 'Infrastructure',
  'Smart Cities', 'Tech Parks', 'Green Buildings', 'Mixed-use',
];

export const LOCATIONS = [
  'All Location', 'Mumbai', 'Bangalore', 'Delhi NCR',
  'Hyderabad', 'Pune', 'Chennai', 'Ahmedabad', 'Kochi',
];
