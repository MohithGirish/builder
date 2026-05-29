/*
 * investors.js — Static mock dataset for the investors directory.
 *
 * Exports INVESTORS (array of investor profile objects), INVESTOR_TYPES
 * (unique type options for the filter dropdown), and INV_LOCATIONS (unique
 * city options). Each investor entry includes id, initials, name, type,
 * location, activeInvestments, portfolioValue, investmentRange, sectors,
 * verified flag, and gradient colours for the card header. Consumed by the
 * Investors directory page and the Home page discover section.
 */
export const INVESTORS = [
  {
    id: 'i1',
    initials: 'AV',
    name: 'Aditya Ventures',
    type: 'Venture Capital Firm',
    location: 'Mumbai, Maharashtra',
    activeInvestments: 12,
    portfolioValue: '₹950 Cr',
    investmentRange: '₹10–100 Cr',
    sectors: ['Real Estate', 'PropTech', 'Infrastructure'],
    verified: true,
    gradientFrom: '#0d9488',
    gradientTo: '#0f766e',
  },
  {
    id: 'i2',
    initials: 'GI',
    name: 'Global India Investment Fund',
    type: 'Private Equity',
    location: 'New Delhi, NCR',
    activeInvestments: 8,
    portfolioValue: '₹2,500 Cr',
    investmentRange: '₹50–200 Cr',
    sectors: ['Infrastructure', 'Smart Cities', 'Commercial'],
    verified: true,
    gradientFrom: '#0f766e',
    gradientTo: '#115e59',
  },
  {
    id: 'i3',
    initials: 'SI',
    name: 'Sanjay Investment Group',
    type: 'Angel Investor Network',
    location: 'Bangalore, Karnataka',
    activeInvestments: 6,
    portfolioValue: '₹350 Cr',
    investmentRange: '₹5–50 Cr',
    sectors: ['Residential', 'Tech-enabled Construction', 'Green Buildings'],
    verified: true,
    gradientFrom: '#14b8a6',
    gradientTo: '#0d9488',
  },
  {
    id: 'i4',
    initials: 'PC',
    name: 'Pinnacle Capital Partners',
    type: 'Private Equity Fund',
    location: 'Hyderabad, Telangana',
    activeInvestments: 15,
    portfolioValue: '₹1,800 Cr',
    investmentRange: '₹25–150 Cr',
    sectors: ['Commercial', 'Smart Cities', 'Hospitality'],
    verified: true,
    gradientFrom: '#0c7a6e',
    gradientTo: '#0a6359',
  },
  {
    id: 'i5',
    initials: 'BF',
    name: 'BharatBuild Fund',
    type: 'Institutional Investor',
    location: 'Pune, Maharashtra',
    activeInvestments: 20,
    portfolioValue: '₹3,200 Cr',
    investmentRange: '₹100–500 Cr',
    sectors: ['Affordable Housing', 'Infrastructure', 'Residential'],
    verified: true,
    gradientFrom: '#0d9488',
    gradientTo: '#14c38e',
  },
  {
    id: 'i6',
    initials: 'HE',
    name: 'Heritage Estates Trust',
    type: 'Real Estate Investment Trust',
    location: 'Chennai, Tamil Nadu',
    activeInvestments: 9,
    portfolioValue: '₹720 Cr',
    investmentRange: '₹20–80 Cr',
    sectors: ['Heritage Properties', 'Commercial', 'Retail Spaces'],
    verified: true,
    gradientFrom: '#115e59',
    gradientTo: '#0f766e',
  },
];

export const INVESTOR_TYPES = [
  'All Types', 'Venture Capital', 'Private Equity',
  'Angel Investor', 'Institutional', 'REIT',
];

export const INV_LOCATIONS = [
  'All Location', 'Mumbai', 'Delhi NCR', 'Bangalore',
  'Hyderabad', 'Pune', 'Chennai',
];
