/*
 * realProjects.js — Mock investor-match data + E-Infra builder helpers.
 *
 * The five real projects themselves now live in the database (seeder
 * 20260708000002-einfra-projects) and are read through lib/projects.js — this
 * file no longer carries their detail-page content.
 *
 * Exports PROJECT_MATCHES: a hard-coded card-shaped summary of those projects
 * with a deterministic match score, standing in for the AI matching service
 * (consumed by DashboardSidebar, BuilderMatches, InvestorDashboard). Also
 * exports EINFRA_PROJECT_EMAIL / isEinfraBuilder, used to route quote requests
 * for the seeded E-Infra builder.
 */

// ponytail: fixed scores and a duplicated card summary — this is mock matching
// data, not a second source of truth for the projects. Delete the whole array
// when the AI /match service is wired to real investor preferences.
export const PROJECT_MATCHES = [
  {
    id: 'one-downtown', name: 'One Downtown', matchScore: 94,
    type: 'Commercial Mixed-Use', category: 'commercial', status: 'Under Construction',
    location: 'Kokapet, Hyderabad', developer: 'RR Corp & e-Infra',
    priceRange: '₹8,000 – ₹15,000 / Sq.Ft.', rera: 'TSRERA P02400006723', color: '#F59E0B',
    highlights: [
      { label: 'Land Area',    value: '1.7 Acres' },
      { label: 'Office Space', value: '3,00,000 Sq.Ft.' },
      { label: 'Co-Working',   value: '1,00,000 Sq.Ft.' },
    ],
  },
  {
    id: 'elegant-nivasa', name: 'Elegant Nivasa', matchScore: 91,
    type: 'Luxury Residential High-Rise', category: 'residential', status: 'Under Construction',
    location: 'Kollur, Hyderabad', developer: 'e-Infra (Foundation on Values)',
    priceRange: '₹75 Lakh – ₹1.5 Cr', rera: 'TS RERA P01100007243', color: '#1E3A5F',
    highlights: [
      { label: 'Land Area',   value: '4 Acres' },
      { label: 'Towers',      value: '3 Towers' },
      { label: 'Total Units', value: '526 Apts.' },
    ],
  },
  {
    id: 'la-casa', name: 'La Casa', matchScore: 89,
    type: 'Luxury Villa Community', category: 'villa', status: 'Under Construction',
    location: 'Adibatla, Hyderabad', developer: 'e-Infra (Foundation on Values)',
    priceRange: '₹1.5 Cr – ₹4 Cr', rera: 'Available on Request', color: '#065F46',
    highlights: [
      { label: 'Type',      value: 'Luxury Villas' },
      { label: 'Location',  value: 'Adibatla, Hyd' },
      { label: 'Developer', value: 'e-Infra' },
    ],
  },
  {
    id: 'skyven-kokapet', name: 'Skyven', matchScore: 86,
    type: 'Ultra-Luxury Residential High-Rise', category: 'residential', status: 'Under Construction',
    location: 'Kokapet, Hyderabad', developer: 'e-Infra (Foundation on Values) & SVR Pingle',
    priceRange: 'On Request', rera: 'TSRERA P02400009501', color: '#6D28D9',
    highlights: [
      { label: 'Total Units', value: '210 Residences' },
      { label: 'Floors',      value: '63 Floors' },
      { label: 'Unit Size',   value: '5,662–6,278 Sq.Ft.' },
    ],
  },
  {
    id: 'moonglade', name: 'Moonglade', matchScore: 83,
    type: 'Luxury Residential Township', category: 'residential', status: 'Under Construction',
    location: 'Kokapet, Hyderabad', developer: 'E-Infra IRA Ventures LLP',
    priceRange: 'On Request', rera: 'TS RERA P02400009267', color: '#1D4ED8',
    highlights: [
      { label: 'Land Area',  value: '14 Acres' },
      { label: 'Towers',     value: '7 Towers, 40 Floors' },
      { label: 'Unit Sizes', value: '1,360–3,950 Sq.Ft.' },
    ],
  },
];

// ── E-Infra test builder ─────────────────────────────────────────────────────
// The seeded builder (builder@e-infra.in) that owns all five projects. Quote
// requests for these projects carry projectEmail 'sales@e-infra.in'.
export const EINFRA_PROJECT_EMAIL = 'sales@e-infra.in';
export const isEinfraBuilder = (user) =>
  !!user?.email && user.email.toLowerCase().endsWith('@e-infra.in');
