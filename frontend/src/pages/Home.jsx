/*
 * Home.jsx — Public landing page.
 *
 * Renders the full marketing homepage including: an aurora hero with CTA,
 * interactive Leaflet map of Hyderabad real-estate projects, live project
 * cards, "How It Works" explainer, animated platform statistics, AI chat
 * preview, tabbed Builders/Projects discovery section, AI precision
 * features, and a trust-and-transparency grid. Scroll-reveal animations and
 * count-up stats give the page a premium, dynamic feel. Navigation to the
 * dashboard or onboarding is driven by the current auth and onboarding state.
 */
import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Bot, Users, Shield,
  Zap, Target, Clock, Building2, TrendingUp, Lock,
  BadgeCheck, Scale, Star, MapPin, ClipboardList, Handshake, IndianRupee, CheckCircle2,
} from 'lucide-react';
import BuilderCard       from '../components/cards/BuilderCard';
import ProjectCard       from '../components/cards/ProjectCard';
import RealProjectCard   from '../components/cards/RealProjectCard';
import SectionPill       from '../components/ui/SectionPill';
import Reveal            from '../components/ui/Reveal';
import Counter           from '../components/ui/Counter';
import CompatibilityInstrument, { BrandMark } from '../components/CompatibilityInstrument';
import { UNIQUE_BUILDERS } from '../data/builders';
import { PROJECTS }      from '../data/projects';
import { REAL_PROJECTS } from '../data/realProjects';

import WhenVisible from '../components/WhenVisible';

const ProjectsMap = lazy(() => import('../components/map/ProjectsMap'));

// Shared placeholder reused for the map's "not yet in view" and "chunk loading"
// states — keeps the same reserved height so there's no layout shift.
const MAP_PLACEHOLDER = (
  <div className="w-full h-[420px] rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-slate-500 text-sm">Loading map…</p>
    </div>
  </div>
);

/* ── Trust items ──────────────────────────────────────────────────────────── */
const TRUST = [
  { icon: BadgeCheck, title: 'Verified Profiles',       desc: 'All builders and investors undergo rigorous verification' },
  { icon: Lock,       title: 'Secure Transactions',     desc: 'Bank-grade encryption for all communications and transactions' },
  { icon: Users,      title: 'Background Checks',       desc: 'Comprehensive verification of credentials and track record' },
  { icon: Scale,      title: 'Legal Compliance',        desc: 'All projects comply with RERA and regulatory requirements' },
  { icon: Star,       title: 'Quality Assurance',       desc: 'Continuous monitoring and quality assessment' },
  { icon: Shield,     title: 'Trusted Platform',        desc: 'Backed by leading institutions and industry bodies' },
];

/* ── How it works ─────────────────────────────────────────────────────────── */
const STEPS = [
  {
    icon: ClipboardList,
    title: 'Create Your Profile',
    desc: 'Builders and investors sign up with verified credentials, showcasing expertise and investment goals.',
  },
  {
    icon: Bot,
    title: 'AI Matchmaking',
    desc: 'Our intelligent model pairs ideal partners based on ROI, risk assessment, and strategic goals.',
  },
  {
    icon: Handshake,
    title: 'Collaborate & Grow',
    desc: 'Dealroom chat, real-time analytics, and transparent communication tools for seamless partnerships.',
    peak: true,   // the outcome — carries the brass peak accent
  },
];

/* ── AI precision features ────────────────────────────────────────────────── */
const AI_FEATURES = [
  { icon: Zap,    title: 'Intelligent Matching',  desc: 'Our AI analyses thousands of data points to find your perfect match.' },
  { icon: Target, title: 'Precision Targeting',   desc: 'Connect with builders and investors aligned with your specific criteria.' },
  { icon: Clock,  title: 'Instant Results',       desc: 'Get matches with verified profiles in seconds, not weeks.' },
];

/* ── Impact stats ─────────────────────────────────────────────────────────── */
const STATS = [
  { icon: Building2,   value: 1200,  suffix: '+',                  label: 'Verified Builders', sub: 'Across India' },
  { icon: TrendingUp,  value: 2300,  suffix: '+',                  label: 'Active Investors',  sub: 'Global Network' },
  { icon: IndianRupee, value: 12000, prefix: '₹', suffix: '+ Cr',  label: 'Projects Funded',   sub: 'Total Investment', peak: true },
  { icon: BadgeCheck,  value: 98,    suffix: '%',                  label: 'Success Rate',      sub: 'Verified Matches' },
];

/* ── Discover section tabs ─────────────────────────────────────────────────── */
const TABS = ['Builders', 'Projects'];

/* Demo readout for the "Powered by Advanced AI" panel — sums to 77/90. */
const AI_DEMO_BREAKDOWN = [
  { key: 'sector',   label: 'Sector',   max: 25, value: 23 },
  { key: 'location', label: 'Location', max: 20, value: 17 },
  { key: 'fit',      label: 'Fit',      max: 25, value: 21 },
  { key: 'roi',      label: 'ROI',      max: 20, value: 16 },
];

/* Mono coordinate eyebrow — the Blueprint Index data voice replaces pill labels. */
function Eyebrow({ children, index, onDark = false }) {
  return (
    <span className={`inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] ${onDark ? 'text-azure' : 'text-brand-600'}`}>
      <span aria-hidden="true" className={onDark ? 'text-white/30' : 'text-slate-300'}>//</span>
      {index != null && <span className={onDark ? 'text-white/45' : 'text-slate-400'}>{index}</span>}
      {children}
    </span>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('Builders');
  const navigate = useNavigate();
  const { isAuthenticated, onboardingComplete, role } = useAuth();

  function handleCTA() {
    if (isAuthenticated && onboardingComplete) {
      navigate(role === 'investor' ? '/investor-dashboard' : '/dashboard');
    } else if (isAuthenticated) {
      navigate('/onboarding');
    } else {
      navigate('/login');
    }
  }

  return (
    <div className="overflow-hidden">

      {/* ════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden aurora bg-slate-950">
        {/* Background image — local + optimized; high fetch priority as the LCP element */}
        <img
          src="/images/hero/aerial.webp"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/72 via-slate-950/58 to-slate-950/85" />
        {/* Dot grid overlay */}
        <div className="absolute inset-0 hero-dot-grid opacity-[0.06] pointer-events-none" />
        {/* Third aurora blob */}
        <div className="aurora-mid" />

        {/* Floating card */}
        <div className="relative z-10 w-full max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl ring-1 ring-white/40 p-8 sm:p-12 animate-scale-in">

            {/* Pill */}
            <div className="flex justify-center mb-6 animate-fade-up" style={{ animationDelay: '60ms' }}>
              <SectionPill><Sparkles size={11} className="mr-1" />AI Powered Investment & Builder Network</SectionPill>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-[2.6rem] font-extrabold text-slate-900 leading-[1.1] mb-4 animate-fade-up" style={{ animationDelay: '140ms' }}>
              Connect Verified Builders with{' '}
              <span className="text-gradient">Global Investors</span>
            </h1>

            <p className="text-slate-600 text-sm leading-relaxed mb-3 max-w-lg mx-auto animate-fade-up" style={{ animationDelay: '220ms' }}>
              Builder.AI Market is India's leading platform for real-estate, infrastructure,
              and venture development. We enable verified builders and investors to discover,
              evaluate, and collaborate on high-value projects—through intelligent AI-driven
              matching and secure digital workflows.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-fade-up" style={{ animationDelay: '300ms' }}>
              <button onClick={handleCTA} className="btn-cta px-7 py-3 text-sm">
                <Sparkles size={15} /> Start Matching with AI
              </button>
              <Link to="/projects" className="btn-ghost px-7 py-3 text-sm">
                Browse Projects
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-slate-100 pt-6 animate-fade-up" style={{ animationDelay: '380ms' }}>
              {[
                '45,000+ Verified Profiles',
                '₹12,000 Cr+ Projects',
                '98% Match Rate',
              ].map((signal) => (
                <div key={signal} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                  <span className="text-xs text-slate-600 font-medium">{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator — premium mouse capsule + cascading chevrons */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2.5 animate-fade-in" style={{ animationDelay: '800ms' }}>
          <span className="text-white/35 text-[9px] uppercase tracking-[0.3em] font-semibold">Scroll</span>

          {/* Mouse capsule */}
          <div className="relative w-[22px] h-[36px] rounded-full flex justify-center overflow-hidden"
               style={{ border: '1.5px solid rgba(255,255,255,0.2)', boxShadow: '0 0 18px rgba(45,212,191,0.12), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
            <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.06), transparent 60%)' }} />
            <div className="absolute top-[6px] w-[4px] h-[7px] rounded-full animate-scroll-wheel"
                 style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 0 8px rgba(45,212,191,0.8)' }} />
          </div>

          {/* Cascading chevrons */}
          <div className="flex flex-col items-center gap-[2px] -mt-0.5">
            {[0, 200, 400].map((delay, idx) => (
              <svg key={idx} width="11" height="7" viewBox="0 0 11 7" fill="none"
                   className="animate-chev-fade"
                   style={{ animationDelay: `${delay}ms` }}>
                <path d="M1 1L5.5 5.5L10 1" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          LIVE PROJECTS MAP — HYDERABAD
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Section header */}
          <Reveal className="grid md:grid-cols-2 gap-8 items-end mb-8">
            <div>
              <div className="mb-4">
                <SectionPill><MapPin size={11} className="mr-1" />Live Project Locations</SectionPill>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
                Featured Real Estate Projects
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Explore live projects across Hyderabad — from premium high-rise residences
                to landmark commercial hubs. Click any pin or card to discover project details.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              {[
                { color: '#F59E0B', label: 'Commercial' },
                { color: '#1E3A5F', label: 'Residential' },
                { color: '#065F46', label: 'Villa' },
                { color: '#6D28D9', label: 'Premium' },
              ].map(({ color, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Real Leaflet map — chunk + OSM tiles only load once scrolled near it */}
          <Reveal delay={80}>
            <WhenVisible placeholder={MAP_PLACEHOLDER} rootMargin="100px">
              <Suspense fallback={MAP_PLACEHOLDER}>
                <ProjectsMap />
              </Suspense>
            </WhenVisible>
          </Reveal>

          <p className="text-slate-400 text-xs mt-3 text-center">
            Click any map pin to preview · Click a project card to view full details
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          PROJECT CARDS BELOW MAP
      ════════════════════════════════════════════════════════════ */}
      <section className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Browse Projects</h3>
            <span className="text-xs text-slate-400 font-medium">{REAL_PROJECTS.length} featured projects</span>
          </Reveal>

          {/* Horizontal scroll on mobile, 3-col wrapping grid on large screens */}
          <div className="flex gap-5 overflow-x-auto pb-3 lg:grid lg:grid-cols-3 xl:grid-cols-3 no-scrollbar">
            {REAL_PROJECTS.map((project, i) => (
              <Reveal key={project.id} delay={i * 70} className="shrink-0 w-[300px] lg:w-full lg:min-w-0">
                <RealProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 bg-white overflow-hidden">
        {/* Blueprint sheet texture */}
        <div className="absolute inset-0 coord-grid opacity-60 pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-14">
            <div className="flex justify-center mb-4">
              <Eyebrow>How it works</Eyebrow>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 font-display">
              How AI Brings Builders &amp; Investors Together
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto text-sm">
              From profile creation to project completion, our AI guides every step of your journey.
            </p>
          </Reveal>

          <div className="relative grid sm:grid-cols-3 gap-6">
            {/* Dimension baseline (desktop) — engineering measurement line, end ticks */}
            <div className="hidden sm:block absolute top-8 left-[16%] right-[16%] h-px bg-slate-200" aria-hidden="true">
              <span className="absolute -left-px -top-1 h-2 w-px bg-slate-300" />
              <span className="absolute -right-px -top-1 h-2 w-px bg-slate-300" />
            </div>

            {STEPS.map(({ icon: Icon, title, desc, peak }, i) => (
              <Reveal key={title} delay={i * 120} className="relative">
                <div className={`relative h-full flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-soft hover:shadow-card transition-shadow duration-300 ${peak ? 'border-brass/40' : 'border-slate-200'}`}>
                  {/* Top hairline accent — brass on the outcome step */}
                  <span className={`absolute top-0 left-6 right-6 h-px ${peak ? 'bg-brass' : 'bg-brand-200'}`} aria-hidden="true" />
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${peak ? 'bg-brass/10 text-brass-700' : 'bg-brand-50 text-brand-600'}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`font-mono text-[11px] font-semibold uppercase tracking-[0.18em] ${peak ? 'text-brass-700' : 'text-slate-400'}`}>
                      Step {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base font-display">{title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          STATS
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden bg-ink">
        {/* Background texture + restrained ambient glow (azure data, brass accent) */}
        <div className="absolute inset-0 hero-dot-grid opacity-[0.04] pointer-events-none" aria-hidden="true" />
        <div className="absolute top-0 left-1/4 w-[460px] h-[460px] rounded-full pointer-events-none" aria-hidden="true"
             style={{ background: 'radial-gradient(circle, rgba(90,160,224,0.10), transparent 65%)', filter: 'blur(70px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[360px] h-[360px] rounded-full pointer-events-none" aria-hidden="true"
             style={{ background: 'radial-gradient(circle, rgba(194,149,74,0.06), transparent 65%)', filter: 'blur(70px)' }} />

        <Reveal className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center mb-14">
          <div className="flex justify-center mb-4">
            <Eyebrow onDark>Platform impact</Eyebrow>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2 font-display">Trusted by Thousands across India</h2>
          <p className="text-slate-400 text-sm">Real numbers. Real impact. Real partnerships.</p>
        </Reveal>

        {/* Hairline data grid — gap-px over a faint surface draws the dividers */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08]">
            {STATS.map(({ icon: Icon, value, prefix, suffix, label, sub, peak }, i) => (
              <Reveal key={label} delay={i * 60} className="h-full">
                <div className="relative h-full bg-ink p-6 group transition-colors duration-300 hover:bg-white/[0.02]">
                  {/* Top accent — brass on the peak figure, azure elsewhere */}
                  <span className={`absolute top-0 left-0 right-0 h-px ${peak ? 'bg-brass' : 'bg-azure/40'}`} aria-hidden="true" />
                  <div className={`w-11 h-11 rounded-xl mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${peak ? 'bg-brass/15 text-brass-300' : 'bg-azure/10 text-azure'}`}>
                    <Icon size={20} />
                  </div>
                  <div className={`text-3xl font-extrabold mb-1 font-mono tabular-nums ${peak ? 'text-brass-300' : 'text-white'}`}>
                    <Counter value={value} prefix={prefix} suffix={suffix} />
                  </div>
                  <div className="text-sm font-semibold text-slate-200">{label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono uppercase tracking-wider">{sub}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          HOW THE AI WORKS
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-12 items-center">

            {/* Left — feature list (60%) */}
            <Reveal className="lg:col-span-3">
              <div className="flex justify-start mb-5">
                <Eyebrow>Powered by advanced AI</Eyebrow>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3 leading-tight font-display">
                AI that understands<br />real estate
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-md">
                Our five-dimension scoring engine analyses thousands of data points to surface
                the right match — every time.
              </p>

              <div className="flex flex-col gap-5">
                {[
                  {
                    title: 'Sector + Location fit scoring',
                    desc: 'Matches builders and investors across 25+ sectors and 50+ cities with geo-weighted relevance.',
                  },
                  {
                    title: 'ROI & risk profiling',
                    desc: 'Analyses historical returns, project stage risk, and funding runway to rank compatibility.',
                  },
                  {
                    title: 'Instant dealroom connection',
                    desc: 'One click from a match to a live, secure dealroom with document sharing and real-time chat.',
                  },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={13} className="text-brand-600" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{title}</p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Right — the signature: a live compatibility readout (40%) */}
            <Reveal delay={120} className="lg:col-span-2">
              <div className="space-y-3">
                {/* Who the readout is for */}
                <div className="flex items-center gap-3 px-1">
                  <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                    RS
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Rajesh Sharma</p>
                    <p className="text-xs text-slate-500 font-mono">Luxury Residential · Hyderabad</p>
                  </div>
                </div>
                <CompatibilityInstrument
                  variant="light"
                  label="Match readout"
                  score={77}
                  breakdown={AI_DEMO_BREAKDOWN}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          DISCOVER PREVIEW (Builders / Investors / Projects tabs)
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <div className="mb-3"><Eyebrow>Directory</Eyebrow></div>
              <h2 className="text-2xl font-extrabold text-slate-900 font-display">Discover Opportunities</h2>
              <p className="text-slate-600 text-sm mt-1">Explore verified builders, investors, and projects</p>
            </div>
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white rounded-2xl p-1 shadow-card border border-slate-200">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-1.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-200
                    ${activeTab === t
                      ? 'text-white shadow-sm bg-brand-gradient'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Grid */}
          {(() => {
            const items =
              activeTab === 'Builders' ? UNIQUE_BUILDERS.slice(0, 3) :
              PROJECTS.slice(0, 3);

            if (items.length === 0) {
              return (
                <div className="col-span-3 text-center py-16">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Clock size={24} className="text-slate-400" />
                  </div>
                  <p className="font-semibold text-slate-600 mb-1">{activeTab} Directory Coming Soon</p>
                  <p className="text-slate-400 text-sm">
                    The {activeTab.toLowerCase()} directory launches soon. Be the first to register.
                  </p>
                </div>
              );
            }

            return (
              <div key={activeTab} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'Builders' && UNIQUE_BUILDERS.slice(0, 3).map((b, i) => <Reveal key={b.id} delay={i * 80}><BuilderCard builder={b} /></Reveal>)}
                {activeTab === 'Projects' && PROJECTS.slice(0, 3).map((p, i)  => <Reveal key={p.id} delay={i * 80}><Link to="/projects" className="block h-full"><ProjectCard project={p} /></Link></Reveal>)}
              </div>
            );
          })()}

          {/* View All CTA */}
          <div className="flex justify-center mt-8">
            <Link
              to={`/${activeTab.toLowerCase()}`}
              className="btn-outline-brand px-8 py-2.5 text-sm"
            >
              View All {activeTab} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          AI PRECISION MATCHMAKING
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Eyebrow>AI-powered intelligence</Eyebrow>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 font-display">
              Find Your Perfect Match<br />with AI Precision
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              Our advanced AI algorithms analyse project requirements, investment preferences,
              and success patterns to create meaningful connections that drive results.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {AI_FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 100}>
                <div className="relative h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-soft hover:shadow-card transition-shadow duration-300 group">
                  <span className="absolute top-0 left-6 right-6 h-px bg-brand-200" aria-hidden="true" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-brand-50 text-brand-600 transition-transform duration-300 group-hover:scale-110">
                      <Icon size={19} />
                    </div>
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2 font-display">{title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* CTA block */}
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-ink p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/[0.08]">
              {/* Restrained ambient glow — azure data + a single brass warm point */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl" aria-hidden="true">
                <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full"
                     style={{ background: 'radial-gradient(circle, rgba(90,160,224,0.18), transparent 65%)', filter: 'blur(55px)' }} />
                <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full"
                     style={{ background: 'radial-gradient(circle, rgba(194,149,74,0.14), transparent 65%)', filter: 'blur(55px)' }} />
                <div className="absolute inset-0 hero-dot-grid opacity-[0.05]" />
              </div>

              <div className="relative z-10">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] mb-2 text-azure">Get started today</p>
                <h3 className="text-xl font-bold text-white mb-2 font-display">Ready to find your ideal partner?</h3>
                <p className="text-slate-400 text-sm max-w-md">
                  Join thousands of verified builders and investors who trust Builder AI Market
                  to create successful partnerships and drive growth.
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-4 shrink-0">
                <BrandMark heights={[10, 16, 26, 20, 14]} onDark className="h-8" />
                <button onClick={handleCTA} className="btn-cta px-7 py-3 text-sm">
                  <Sparkles size={14} /> Start AI Matching
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          TRUST & TRANSPARENCY
      ════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 coord-grid opacity-60 pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Eyebrow>Trust &amp; compliance</Eyebrow>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 font-display">
              Built on Trust &amp; Transparency
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto">
              Your security is our priority. We maintain the highest standards of verification,
              compliance, and transparency to ensure safe and successful partnerships.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-5">
            {TRUST.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={(i % 2) * 80}>
                <div className="relative bg-white rounded-2xl p-5 flex gap-4 items-start border border-slate-200 hover:border-brand-300 transition-colors duration-200 h-full shadow-soft">
                  <span className="font-mono text-[11px] font-semibold text-slate-300 tabular-nums pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-brand-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-1 font-display">{title}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
