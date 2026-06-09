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
/* Mock investor profiles have been removed. Investor data will be served from
   the backend API once the investor registration and profile flow is complete. */
export const INVESTORS = [];

export const INVESTOR_TYPES = [
  'All Types', 'Venture Capital', 'Private Equity',
  'Angel Investor', 'Institutional', 'REIT',
];

export const INV_LOCATIONS = [
  'All Location', 'Mumbai', 'Delhi NCR', 'Bangalore',
  'Hyderabad', 'Pune', 'Chennai',
];
