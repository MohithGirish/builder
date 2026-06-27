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
  { id: 'active_projects',   label: 'Active Projects',   value: '5',       change: '+2 this month', positive: true,  icon: 'Briefcase',  color: 'bg-teal-50 text-teal-600',    sparkline: [3,4,3,5,4,6,5] },
  { id: 'total_raised',      label: 'Total Raised',      value: '₹128 Cr', change: '+18%',          positive: true,  icon: 'TrendingUp', color: 'bg-orange-50 text-orange-500', sparkline: [10,12,11,14,13,16,18] },
  { id: 'investor_matches',  label: 'Investor Matches',  value: '24',      change: '+6 new',        positive: true,  icon: 'Users',      color: 'bg-blue-50 text-blue-600',     sparkline: [2,3,4,3,5,4,6] },
  { id: 'profile_views',     label: 'Profile Views',     value: '1,840',   change: '-8%',           positive: false, icon: 'Eye',        color: 'bg-amber-50 text-amber-500',   sparkline: [130,120,125,115,120,110,108] },
];

export const INVESTOR_KPIS = [
  { id: 'total_invested',   label: 'Total Invested',   value: '₹85 Cr', change: '+12%',          positive: true,  icon: 'Wallet',     color: 'bg-teal-50 text-teal-600',    sparkline: [40,50,48,60,58,70,80] },
  { id: 'avg_roi',          label: 'Avg ROI',          value: '21.4%',  change: '+1.2%',         positive: true,  icon: 'TrendingUp', color: 'bg-orange-50 text-orange-500', sparkline: [18,19,18,20,21,22,23] },
  { id: 'active_projects',  label: 'Active Projects',  value: '9',      change: '+1 this month', positive: true,  icon: 'Briefcase',  color: 'bg-blue-50 text-blue-600',     sparkline: [5,6,6,7,7,8,9] },
  { id: 'builder_matches',  label: 'Project Matches',  value: '5',      change: '+5 new',        positive: true,  icon: 'Sparkles',   color: 'bg-amber-50 text-amber-500',   sparkline: [1,2,3,3,4,5,5] },
];

export const BUILDER_ANALYTICS_KPIS = [
  { label: 'Total Projects',        value: '12',      change: '+3 this year', positive: true, icon: 'Briefcase',  sparkline: [6,7,8,9,10,11,12] },
  { label: 'Total Funding Secured', value: '₹775 Cr', change: '+22%',         positive: true, icon: 'TrendingUp', sparkline: [380,440,510,590,680,730,775] },
  { label: 'Active Investors',      value: '38',      change: '+9',           positive: true, icon: 'Users',      sparkline: [18,22,25,29,33,36,38] },
  { label: 'Avg Match Rate',        value: '82%',     change: '+4%',          positive: true, icon: 'Star',       sparkline: [70,72,74,76,78,80,82] },
];

export const INVESTOR_ANALYTICS_KPIS = [
  { label: 'Total Invested',     value: '₹85 Cr', change: '+12%',   positive: true, icon: 'Wallet',     sparkline: [40,50,55,62,70,78,85] },
  { label: 'Active Investments', value: '9',      change: '+1',     positive: true, icon: 'Briefcase',  sparkline: [4,5,6,6,7,8,9] },
  { label: 'Portfolio ROI',      value: '21.4%',  change: '+1.2%',  positive: true, icon: 'TrendingUp', sparkline: [17,18,18,19,20,21,21] },
  { label: 'Builder Matches',    value: '5',      change: '+5 new', positive: true, icon: 'Sparkles',   sparkline: [1,2,3,4,4,5,5] },
];

// Investor leads surfaced to builders (InvestorMatches page + dashboard recommendations).
export const INVESTOR_LEADS = [
  { id: 'lead-1', category: 'vc',    avatar_color: '#0d9488', initials: 'LV', company: 'Lighthouse Ventures',      is_verified: true,  type: 'VC Firm',        city: 'Mumbai',    match_score: 94, investment_range: '₹50–150 Cr',  sectors: ['Residential', 'Commercial'],    focus_areas: ['Mumbai', 'Pune'],       active_deals: 7, portfolio: '₹1,200 Cr AUM' },
  { id: 'lead-2', category: 'pe',    avatar_color: '#f97316', initials: 'MC', company: 'Meridian Capital Partners', is_verified: true,  type: 'PE Fund',        city: 'Delhi',     match_score: 90, investment_range: '₹100–300 Cr', sectors: ['Infrastructure', 'Commercial'], focus_areas: ['NCR', 'Bangalore'],     active_deals: 5, portfolio: '₹3,400 Cr AUM' },
  { id: 'lead-3', category: 'vc',    avatar_color: '#7c3aed', initials: 'GR', company: 'Greenfield Realty Fund',    is_verified: true,  type: 'VC Firm',        city: 'Hyderabad', match_score: 88, investment_range: '₹40–120 Cr',  sectors: ['Smart Cities', 'Mixed-use'],    focus_areas: ['Hyderabad', 'Chennai'], active_deals: 6, portfolio: '₹900 Cr AUM' },
  { id: 'lead-4', category: 'pe',    avatar_color: '#4f46e5', initials: 'SI', company: 'Sterling Infra Partners',   is_verified: true,  type: 'PE Fund',        city: 'Pune',      match_score: 84, investment_range: '₹150–400 Cr', sectors: ['Infrastructure'],               focus_areas: ['Pune', 'Mumbai'],       active_deals: 4, portfolio: '₹5,100 Cr AUM' },
  { id: 'lead-5', category: 'angel', avatar_color: '#2563eb', initials: 'AM', company: 'Arjun Mehta',               is_verified: false, type: 'Angel Investor', city: 'Bangalore', match_score: 81, investment_range: '₹2–10 Cr',    sectors: ['PropTech', 'Residential'],      focus_areas: ['Bangalore'],            active_deals: 3, portfolio: '12 startups' },
  { id: 'lead-6', category: 'angel', avatar_color: '#e11d48', initials: 'PN', company: 'Priya Nair',                is_verified: false, type: 'Angel Investor', city: 'Chennai',   match_score: 78, investment_range: '₹1–8 Cr',     sectors: ['Residential', 'Hospitality'],   focus_areas: ['Chennai'],              active_deals: 2, portfolio: '8 startups' },
];

// Top 3 leads shown on the builder dashboard "AI Match Recommendations".
export const INVESTOR_RECOMMENDATIONS = INVESTOR_LEADS.slice(0, 3);

export const BUILDER_RECOMMENDATIONS  = [];
export const MY_PROJECTS              = [];
export const MY_INVESTMENTS           = [];
export const BUILDER_LEADS            = [];

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
