/*
 * builders.js — Static mock dataset for the builders directory.
 *
 * Exports BUILDERS (array of builder profile objects), SECTORS (unique sector
 * options for the filter dropdown), and LOCATIONS (unique city options). Each
 * builder entry includes id, initials, name, company, location, rating,
 * projects, totalValue, sectors, verified flag, and a cover image URL.
 * Consumed by the Builders directory page, BuildersFeed, and the Home page
 * discover section.
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

export const SECTORS = [
  'All Sectors', 'Residential', 'Commercial', 'Infrastructure',
  'Smart Cities', 'Tech Parks', 'Green Buildings', 'Mixed-use',
];

export const LOCATIONS = [
  'All Location', 'Mumbai', 'Bangalore', 'Delhi NCR',
  'Hyderabad', 'Pune', 'Chennai', 'Ahmedabad', 'Kochi',
];
