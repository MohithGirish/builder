/*
 * dashboard.js — Static mock data for builder and investor dashboard pages.
 *
 * Exports KPI arrays (BUILDER_KPIS, INVESTOR_KPIS), recommendation lists
 * (INVESTOR_RECOMMENDATIONS, BUILDER_RECOMMENDATIONS), match lead lists
 * (INVESTOR_LEADS, BUILDER_LEADS), investment portfolio (MY_INVESTMENTS),
 * project management data (MY_PROJECTS, PROJECT_TYPES, PROJECT_CITIES),
 * analytics KPIs, chart series data, AI insight text, and demo user objects.
 * All data is consumed by dashboard pages and components without API calls.
 */
/* All mock user, KPI, recommendation, project, investment, and lead data has
   been removed. These will be fetched from the backend API as the platform
   matures. Only structural configuration arrays (PROJECT_TYPES, PROJECT_CITIES)
   are retained below as they are used in form inputs, not as display data. */

export const BUILDER_USER  = null;
export const INVESTOR_USER = null;

export const BUILDER_KPIS = [
  { id: 'active_projects',   label: 'Active Projects',   value: '—', change: '', positive: false, icon: 'Briefcase',  color: 'bg-teal-50 text-teal-600' },
  { id: 'total_raised',      label: 'Total Raised',      value: '—', change: '', positive: false, icon: 'TrendingUp', color: 'bg-orange-50 text-orange-500' },
  { id: 'investor_matches',  label: 'Investor Matches',  value: '—', change: '', positive: false, icon: 'Users',      color: 'bg-blue-50 text-blue-600' },
  { id: 'profile_views',     label: 'Profile Views',     value: '—', change: '', positive: false, icon: 'Eye',        color: 'bg-amber-50 text-amber-500' },
];

export const INVESTOR_KPIS = [
  { id: 'total_invested',   label: 'Total Invested',   value: '—', change: '', positive: false, icon: 'Wallet',     color: 'bg-teal-50 text-teal-600' },
  { id: 'avg_roi',          label: 'Avg ROI',          value: '—', change: '', positive: false, icon: 'TrendingUp', color: 'bg-orange-50 text-orange-500' },
  { id: 'active_projects',  label: 'Active Projects',  value: '—', change: '', positive: false, icon: 'Briefcase',  color: 'bg-blue-50 text-blue-600' },
  { id: 'builder_matches',  label: 'Builder Matches',  value: '—', change: '', positive: false, icon: 'Sparkles',   color: 'bg-amber-50 text-amber-500' },
];

export const BUILDER_ANALYTICS_KPIS = [
  { label: 'Total Projects',        value: '—', change: '', positive: false, icon: 'Briefcase' },
  { label: 'Total Funding Secured', value: '—', change: '', positive: false, icon: 'TrendingUp' },
  { label: 'Active Investors',      value: '—', change: '', positive: false, icon: 'Users' },
  { label: 'Avg Match Rate',        value: '—', change: '', positive: false, icon: 'Star' },
];

export const INVESTOR_ANALYTICS_KPIS = [
  { label: 'Total Invested',     value: '—', change: '', positive: false, icon: 'Wallet' },
  { label: 'Active Investments', value: '—', change: '', positive: false, icon: 'Briefcase' },
  { label: 'Portfolio ROI',      value: '—', change: '', positive: false, icon: 'TrendingUp' },
  { label: 'Builder Matches',    value: '—', change: '', positive: false, icon: 'Sparkles' },
];

export const INVESTOR_RECOMMENDATIONS = [];
export const BUILDER_RECOMMENDATIONS  = [];
export const MY_PROJECTS              = [];
export const MY_INVESTMENTS           = [];
export const BUILDER_LEADS            = [];
export const INVESTOR_LEADS           = [];

// ─── Analytics Chart Data ────────────────────────────────────────────────────

export const BUILDER_CHART_DATA = {
  funding_trend: {
    label: 'Funding Trend',
    subtitle: 'Last 6 months performance (in Crores)',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { name: 'Raised', color: '#f97316', data: [52, 61, 68, 74, 83, 95] },
      { name: 'Target', color: '#0d9488', data: [60, 70, 80, 90, 100, 110] },
    ],
  },
  sectors: ['Luxury Residential', 'Commercial', 'Infrastructure', 'Smart Cities', 'Mixed-use'],
  sector_data: [40, 25, 15, 12, 8],
};

export const INVESTOR_CHART_DATA = {
  investment_trend: {
    label: 'Investment Trend',
    subtitle: 'Last 6 months performance (in Crores)',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { name: 'Invested', color: '#f97316', data: [50, 65, 80, 100, 140, 180] },
      { name: 'Returns',  color: '#0d9488', data: [4,  7,  12, 18,  26,  38] },
    ],
  },
  sectors: ['Residential', 'Commercial', 'Infrastructure', 'PropTech'],
  sector_data: [45, 30, 20, 5],
};

export const BUILDER_AI_INSIGHT =
  'Residential projects in South India see a 23% higher match rate this quarter. Smart Cities sector shows the highest ROI potential at 25%. Consider expanding portfolio in Bangalore and Hyderabad markets for optimal investor interest.';

export const INVESTOR_AI_INSIGHT =
  'Your portfolio shows strong diversification across sectors. Infrastructure investments are delivering above-market returns (22% vs 18% market avg). Consider increasing allocation to Smart Cities sector which shows 25% ROI potential.';

// ─── Project type options ─────────────────────────────────────────────────────

export const PROJECT_TYPES = [
  'Luxury Residential',
  'Affordable Housing',
  'Commercial',
  'Mixed-use',
  'Infrastructure',
  'Smart Cities',
  'Tech Parks',
  'Industrial',
  'Hospitality',
];

export const PROJECT_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Pune', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Surat',
];
