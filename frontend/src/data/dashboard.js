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
// ─── Users ──────────────────────────────────────────────────────────────────

export const BUILDER_USER = {
  id:          'user-builder-1',
  role:        'builder',
  first_name:  'Imat',
  last_name:   'Delhi',
  company:     'Kumar Infrastructure Pvt. Ltd.',
  city:        'Mumbai',
  is_verified: true,
  avatar_initials: 'ID',
};

export const INVESTOR_USER = {
  id:          'user-investor-1',
  role:        'investor',
  first_name:  'Imat',
  last_name:   '',
  company:     'VC Firm',
  city:        'Mumbai',
  is_verified: true,
  avatar_initials: 'T',
};

// ─── Builder KPIs ────────────────────────────────────────────────────────────

export const BUILDER_KPIS = [
  {
    id:       'active_projects',
    label:    'Active Projects',
    value:    '2',
    change:   '+2 this month',
    positive: true,
    icon:     'Briefcase',
    color:    'bg-teal-50 text-teal-600',
  },
  {
    id:       'total_raised',
    label:    'Total Raised',
    value:    '70%',
    subtext:  'avg funded',
    change:   '+15% vs last quarter',
    positive: true,
    icon:     'TrendingUp',
    color:    'bg-orange-50 text-orange-500',
  },
  {
    id:       'investor_matches',
    label:    'Investor Matches',
    value:    '6',
    change:   '+3 new',
    positive: true,
    icon:     'Users',
    color:    'bg-blue-50 text-blue-600',
  },
  {
    id:       'profile_views',
    label:    'Profile Views',
    value:    '1,240',
    change:   '+240 today',
    positive: true,
    icon:     'Eye',
    color:    'bg-amber-50 text-amber-500',
  },
];

// ─── Investor KPIs ───────────────────────────────────────────────────────────

export const INVESTOR_KPIS = [
  {
    id:       'total_invested',
    label:    'Total Invested',
    value:    '₹200 Cr',
    change:   '+12% this quarter',
    positive: true,
    icon:     'Wallet',
    color:    'bg-teal-50 text-teal-600',
  },
  {
    id:       'avg_roi',
    label:    'Avg ROI',
    value:    '69%',
    subtext:  'avg',
    change:   '+8% vs last year',
    positive: true,
    icon:     'TrendingUp',
    color:    'bg-orange-50 text-orange-500',
  },
  {
    id:       'active_projects',
    label:    'Active Projects',
    value:    '2',
    change:   '2 active',
    positive: true,
    icon:     'Briefcase',
    color:    'bg-blue-50 text-blue-600',
  },
  {
    id:       'builder_matches',
    label:    'Builder Matches',
    value:    '4x',
    change:   '+4 new',
    positive: true,
    icon:     'Sparkles',
    color:    'bg-amber-50 text-amber-500',
  },
];

// ─── Builder Analytics KPIs ──────────────────────────────────────────────────

export const BUILDER_ANALYTICS_KPIS = [
  { label: 'Total Projects',        value: '11',        change: '+2 this quarter',    positive: true,  icon: 'Briefcase' },
  { label: 'Total Funding Secured', value: '1470 Cr',   change: '+18% vs last quarter', positive: true, icon: 'TrendingUp' },
  { label: 'Active Investors',      value: '427',       change: '+16 new this month', positive: true,  icon: 'Users' },
  { label: 'Avg Match Rate',        value: '87%',       change: '+2% improvement',    positive: true,  icon: 'Star' },
];

// ─── Investor Analytics KPIs ─────────────────────────────────────────────────

export const INVESTOR_ANALYTICS_KPIS = [
  { label: 'Total Invested',    value: '₹180 Cr', change: '+29% growth',        positive: true,  icon: 'Wallet' },
  { label: 'Active Investments',value: '3',       change: '1 completed',        positive: true,  icon: 'Briefcase' },
  { label: 'Portfolio ROI',     value: '14%',     change: 'Above 10.5% target', positive: true,  icon: 'TrendingUp' },
  { label: 'Builder Matches',   value: '4x',      change: '+13 this week',      positive: true,  icon: 'Sparkles' },
];

// ─── Investor Recommendations (shown on Builder Dashboard) ───────────────────

export const INVESTOR_RECOMMENDATIONS = [
  {
    id:               'inv-1',
    company:          'Aditya Ventures',
    type:             'VC Firm',
    city:             'Mumbai',
    state:            'Maharashtra',
    is_verified:      true,
    match_score:      96,
    investment_range: '₹10-100 Cr',
    sectors:          ['Luxury Residential', 'Commercial'],
    active_deals:     12,
    portfolio:        '₹500 Cr',
    avatar_color:     'linear-gradient(135deg,#7c3aed,#a78bfa)',
    initials:         'AV',
  },
  {
    id:               'inv-2',
    company:          'Global India Fund',
    type:             'PE Fund',
    city:             'Delhi',
    state:            'NCR',
    is_verified:      true,
    match_score:      88,
    investment_range: '₹50-500 Cr',
    sectors:          ['Infrastructure', 'Commercial'],
    active_deals:     8,
    portfolio:        '₹850 Cr',
    avatar_color:     'linear-gradient(135deg,#0891b2,#38bdf8)',
    initials:         'GI',
  },
  {
    id:               'inv-3',
    company:          'Sharma Capital',
    type:             'Angel Investor',
    city:             'Bangalore',
    state:            'Karnataka',
    is_verified:      true,
    match_score:      81,
    investment_range: '₹5-50 Cr',
    sectors:          ['Residential', 'PropTech'],
    active_deals:     5,
    portfolio:        '₹120 Cr',
    avatar_color:     'linear-gradient(135deg,#059669,#34d399)',
    initials:         'SC',
  },
];

// ─── Builder Recommendations (shown on Investor Dashboard) ───────────────────

export const BUILDER_RECOMMENDATIONS = [
  {
    id:             'bld-1',
    name:           'Rajesh Kumar',
    company:        'Kumar Infrastructure Pvt. Ltd.',
    city:           'Mumbai',
    state:          'Maharashtra',
    is_verified:    true,
    match_score:    97,
    projects:       45,
    total_value:    '₹750 Cr',
    rating:         4.8,
    sectors:        ['Luxury Residential', 'Commercial', 'Smart Cities'],
    funding_req:    '₹250 Cr',
    image_url:      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
    avatar_color:   'linear-gradient(135deg,#0d9488,#14c38e)',
    initials:       'RK',
  },
  {
    id:             'bld-2',
    name:           'Priya Sharma',
    company:        'Sharma Tech Parks & Developers',
    city:           'Bangalore',
    state:          'Karnataka',
    is_verified:    true,
    match_score:    92,
    projects:       38,
    total_value:    '₹422 Cr',
    rating:         4.5,
    sectors:        ['Tech Parks', 'Street Buildings', 'Co-working Spaces'],
    funding_req:    '₹180 Cr',
    image_url:      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
    avatar_color:   'linear-gradient(135deg,#7c3aed,#a78bfa)',
    initials:       'PS',
  },
  {
    id:             'bld-3',
    name:           'Vikram Patel',
    company:        'Patel Infrastructure & Construction',
    city:           'Ahmedabad',
    state:          'Gujarat',
    is_verified:    true,
    match_score:    85,
    projects:       52,
    total_value:    '₹720 Cr',
    rating:         4.7,
    sectors:        ['Infrastructure', 'Roads & Bridges', 'Highways'],
    funding_req:    '₹320 Cr',
    image_url:      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
    avatar_color:   'linear-gradient(135deg,#dc2626,#f87171)',
    initials:       'VP',
  },
];

// ─── Projects (My Projects — Builder) ────────────────────────────────────────

export const MY_PROJECTS = [
  {
    id:              'proj-1',
    name:            'Skyline Towers',
    project_type:    'Luxury Residential',
    location:        'Worli',
    city:            'Mumbai',
    status:          'active',
    funding_target:  250,
    funding_raised:  175,
    investor_count:  24,
    view_count:      1347,
    rera_approved:   true,
    roi_projected:   18,
    image_url:       'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    description:     'Premium luxury residential tower in the heart of Worli, Mumbai. 48-storey mixed-use development with world-class amenities.',
  },
  {
    id:              'proj-2',
    name:            'Tech Park Phase 2',
    project_type:    'Commercial',
    location:        'Whitefield',
    city:            'Bangalore',
    status:          'active',
    funding_target:  180,
    funding_raised:  126,
    investor_count:  18,
    view_count:      892,
    rera_approved:   true,
    roi_projected:   22,
    image_url:       'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    description:     'State-of-the-art technology park in Whitefield featuring Grade A office spaces, co-working facilities, and innovation labs.',
  },
];

// ─── Investments (My Investments — Investor) ─────────────────────────────────

export const MY_INVESTMENTS = [
  {
    id:           'inv-deal-1',
    project_name: 'Skyline Towers',
    company:      'Kumar Infrastructure',
    city:         'Mumbai',
    invested:     80,
    roi:          18,
    status:       'active',
    progress:     70,
    project_image:'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80',
  },
  {
    id:           'inv-deal-2',
    project_name: 'Green Valley Residences',
    company:      'Dream Developers',
    city:         'Pune',
    invested:     40,
    roi:          22,
    status:       'active',
    progress:     85,
    project_image:'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80',
  },
  {
    id:           'inv-deal-3',
    project_name: 'Tech Hub Phase 1',
    company:      'Sharma Tech Parks',
    city:         'Bangalore',
    invested:     90,
    roi:          35,
    status:       'completed',
    progress:     100,
    project_image:'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80',
  },
];

// ─── Builder Leads (Investor's Matches) ──────────────────────────────────────

export const BUILDER_LEADS = [
  {
    id:           'bl-1',
    name:         'Rajesh Kumar',
    company:      'Kumar Infrastructure Pvt. Ltd.',
    is_verified:  true,
    match_score:  91,
    city:         'Worli, Mumbai',
    projects_done: 45,
    sectors:      ['Luxury Residential'],
    highlight_tags: ['High-rise', 'Premium Location', 'RERA Approved'],
    funding_req:  250,
    rating:       '4.9/5.0',
    total_value:  '₹750 Cr',
    category:     'residential',
    initials:     'RK',
    avatar_color: 'linear-gradient(135deg,#0d9488,#14c38e)',
  },
  {
    id:           'bl-2',
    name:         'Priya Sharma',
    company:      'Sharma Developers',
    is_verified:  true,
    match_score:  85,
    city:         'Whitefield, Bangalore',
    projects_done: 38,
    sectors:      ['Commercial'],
    highlight_tags: ['Tech Park', 'Grade A Offices', 'IT Hub Expansion'],
    funding_req:  180,
    rating:       '4.7/5.0',
    total_value:  '₹422 Cr',
    category:     'commercial',
    initials:     'PS',
    avatar_color: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
  },
  {
    id:           'bl-3',
    name:         'Vikram Patel',
    company:      'Patel Infrastructure',
    is_verified:  true,
    match_score:  78,
    city:         'Ahmedabad',
    projects_done: 52,
    sectors:      ['Infrastructure'],
    highlight_tags: ['Roads & Bridges', 'Highways', 'PPP Projects'],
    funding_req:  320,
    rating:       '4.8/5.0',
    total_value:  '₹720 Cr',
    category:     'infrastructure',
    initials:     'VP',
    avatar_color: 'linear-gradient(135deg,#dc2626,#f87171)',
  },
  {
    id:           'bl-4',
    name:         'Ananya Singh',
    company:      'Green Spaces Developers',
    is_verified:  false,
    match_score:  72,
    city:         'Hyderabad',
    projects_done: 20,
    sectors:      ['Residential', 'Commercial'],
    highlight_tags: ['Smart Cities', 'Sustainable Design'],
    funding_req:  120,
    rating:       '4.5/5.0',
    total_value:  '₹190 Cr',
    category:     'residential',
    initials:     'AS',
    avatar_color: 'linear-gradient(135deg,#d97706,#fbbf24)',
  },
];

// ─── Investor Leads (Builder's Matches) ──────────────────────────────────────

export const INVESTOR_LEADS = [
  {
    id:               'il-1',
    company:          'Aditya Ventures',
    type:             'VC Firm',
    city:             'Mumbai, Maharashtra',
    is_verified:      true,
    match_score:      96,
    investment_range: '₹10-100 Cr',
    sectors:          ['Luxury Residential', 'Commercial'],
    focus_areas:      ['High-rise Development', 'Sustainable Design', 'Premium Locations'],
    active_deals:     12,
    portfolio:        '₹500 Cr Portfolio',
    category:         'vc',
    initials:         'AV',
    avatar_color:     'linear-gradient(135deg,#7c3aed,#a78bfa)',
  },
  {
    id:               'il-2',
    company:          'Global India Fund',
    type:             'PE Fund',
    city:             'Delhi, NCR',
    is_verified:      true,
    match_score:      88,
    investment_range: '₹50-500 Cr',
    sectors:          ['Infrastructure', 'Commercial', 'Mixed-use'],
    focus_areas:      ['Urban Renewal', 'Smart Infrastructure'],
    active_deals:     8,
    portfolio:        '₹850 Cr Portfolio',
    category:         'pe',
    initials:         'GI',
    avatar_color:     'linear-gradient(135deg,#0891b2,#38bdf8)',
  },
  {
    id:               'il-3',
    company:          'Sharma Capital',
    type:             'Angel Investor',
    city:             'Bangalore, Karnataka',
    is_verified:      true,
    match_score:      81,
    investment_range: '₹5-50 Cr',
    sectors:          ['Residential', 'PropTech'],
    focus_areas:      ['Tier-2 Cities', 'Affordable Housing'],
    active_deals:     5,
    portfolio:        '₹120 Cr Portfolio',
    category:         'angel',
    initials:         'SC',
    avatar_color:     'linear-gradient(135deg,#059669,#34d399)',
  },
  {
    id:               'il-4',
    company:          'Nexus Real Estate Fund',
    type:             'PE Fund',
    city:             'Hyderabad, Telangana',
    is_verified:      true,
    match_score:      74,
    investment_range: '₹25-200 Cr',
    sectors:          ['Commercial', 'Mixed-use', 'Smart Cities'],
    focus_areas:      ['Tech Parks', 'Co-working', 'Sustainable Buildings'],
    active_deals:     6,
    portfolio:        '₹310 Cr Portfolio',
    category:         'pe',
    initials:         'NR',
    avatar_color:     'linear-gradient(135deg,#d97706,#fbbf24)',
  },
];

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
