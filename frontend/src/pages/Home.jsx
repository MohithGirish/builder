/*
 * Home.jsx — Public landing page.
 *
 * Renders the full marketing homepage including: an aurora hero with CTA,
 * interactive Leaflet map of Hyderabad real-estate projects, live project
 * cards, "How It Works" explainer, animated platform statistics, AI chat
 * preview, tabbed Builders/Investors/Projects discovery section, AI precision
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
  BadgeCheck, Scale, Star, Send, MapPin, ClipboardList, Handshake, IndianRupee,
} from 'lucide-react';
import BuilderCard       from '../components/cards/BuilderCard';
import InvestorCard      from '../components/cards/InvestorCard';
import ProjectCard       from '../components/cards/ProjectCard';
import RealProjectCard   from '../components/cards/RealProjectCard';
import SectionPill       from '../components/ui/SectionPill';
import Reveal            from '../components/ui/Reveal';
import Counter           from '../components/ui/Counter';
import { BUILDERS }      from '../data/builders';
import { INVESTORS }     from '../data/investors';
import { PROJECTS }      from '../data/projects';
import { REAL_PROJECTS } from '../data/realProjects';

const ProjectsMap = lazy(() => import('../components/map/ProjectsMap'));

/* ── AI Chat preview messages ─────────────────────────────────────────────── */
const AI_MESSAGES = [
  { from: 'user', text: "I'm looking for luxury residential developers in Mumbai with 40+ projects." },
  { from: 'ai',   text: "Found 4 verified builders matching your criteria! Rajesh Kumar from Kumar Infrastructure (4.8★, 45 projects) leads the list with 94% match score. Would you like to see their profiles?" },
  { from: 'user', text: "Yes please, send more matches!" },
];

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
    color: 'from-teal-500 to-teal-600',
    title: 'Create Your Profile',
    desc: 'Builders and investors sign up with verified credentials, showcasing expertise and investment goals.',
  },
  {
    icon: Bot,
    color: 'from-teal-600 to-teal-700',
    title: 'AI Matchmaking',
    desc: 'Our intelligent model pairs ideal partners based on ROI, risk assessment, and strategic goals.',
  },
  {
    icon: Handshake,
    color: 'from-amber-500 to-orange-500',
    title: 'Collaborate & Grow',
    desc: 'Dealroom chat, real-time analytics, and transparent communication tools for seamless partnerships.',
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
  { icon: Building2,   value: 1200,  suffix: '+',     label: 'Verified Builders', sub: 'Across India',      accent: '#f97316' },
  { icon: TrendingUp,  value: 2300,  suffix: '+',     label: 'Active Investors',  sub: 'Global Network',    accent: '#0d9488' },
  { icon: IndianRupee, value: 12000, prefix: '₹', suffix: '+ Cr', label: 'Projects Funded', sub: 'Total Investment', accent: '#f59e0b' },
  { icon: BadgeCheck,  value: 98,    suffix: '%',     label: 'Success Rate',      sub: 'Verified Matches',  accent: '#16a34a' },
];

/* ── Hero mini-stats ──────────────────────────────────────────────────────── */
const HERO_STATS = [
  { icon: BadgeCheck, label: 'Verified Profiles' },
  { icon: Bot,        label: 'AI-Driven Matchmaking' },
  { icon: IndianRupee, label: '₹2000 Cr+ in Active Projects' },
];

/* ── Discover section tabs ─────────────────────────────────────────────────── */
const TABS = ['Builders', 'Investors', 'Projects'];

export default function Home() {
  const [activeTab, setActiveTab] = useState('Builders');
  const [chatInput, setChatInput] = useState('');
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
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/55 to-slate-950/80" />

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

            <p className="text-brand-700 text-sm italic font-medium mb-8 animate-fade-up" style={{ animationDelay: '300ms' }}>
              "Empowering India's growth through trusted partnerships and data-driven investments."
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-fade-up" style={{ animationDelay: '380ms' }}>
              <button onClick={handleCTA} className="btn-cta px-7 py-3 text-sm">
                <Sparkles size={15} /> Start Matching with AI
              </button>
              <Link to="/projects" className="btn-ghost px-7 py-3 text-sm">
                Browse Projects
              </Link>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 animate-fade-up" style={{ animationDelay: '460ms' }}>
              {HERO_STATS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <span className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                    <Icon size={16} className="text-brand-600" />
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-1.5 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <span className="text-white/60 text-[10px] uppercase tracking-widest font-semibold">Scroll</span>
          <span className="w-5 h-8 rounded-full border border-white/40 flex items-start justify-center p-1">
            <span className="w-1 h-2 rounded-full bg-white/70 animate-float" />
          </span>
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

          {/* Real Leaflet map */}
          <Reveal delay={80}>
            <Suspense fallback={
              <div className="w-full h-[420px] rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#0d9488', borderTopColor: 'transparent' }} />
                  <p className="text-slate-500 text-sm">Loading map…</p>
                </div>
              </div>
            }>
              <ProjectsMap />
            </Suspense>
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

          {/* Horizontal scroll on mobile, 5-col grid on large screens */}
          <div className="flex gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-5 no-scrollbar">
            {REAL_PROJECTS.map((project, i) => (
              <Reveal key={project.id} delay={i * 70} className="shrink-0 w-[260px] lg:w-full lg:min-w-0">
                <RealProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <SectionPill>Simple. Intelligent. Effective.</SectionPill>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              How AI Brings Builders & Investors Together
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              From profile creation to project completion, our AI guides every step of your journey.
            </p>
          </Reveal>

          <div className="relative grid sm:grid-cols-3 gap-6">
            {/* Connector line (desktop) */}
            <div className="hidden sm:block absolute top-6 left-[16%] right-[16%] h-px bg-gradient-to-r from-brand-200 via-brand-300 to-amber-300" />

            {STEPS.map(({ icon: Icon, color, title, desc }, i) => (
              <Reveal key={title} delay={i * 120} className="relative">
                <div className="card p-6 flex flex-col gap-4 h-full">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <span className="w-7 h-7 rounded-full bg-white border-2 border-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold shadow-sm">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          STATS
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-amber-50 to-white">
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Trusted by Thousands across India</h2>
          <p className="text-slate-500 text-sm">Real numbers. Real impact. Real partnerships.</p>
        </Reveal>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map(({ icon: Icon, value, prefix, suffix, label, sub, accent }, i) => (
            <Reveal key={label} delay={i * 90}>
              <div className="card p-6 group">
                <div
                  className="w-11 h-11 rounded-2xl mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ background: accent + '18' }}
                >
                  <Icon size={20} style={{ color: accent }} />
                </div>
                <div className="text-2xl font-extrabold text-slate-800 mb-1 font-display tabular-nums">
                  <Counter value={value} prefix={prefix} suffix={suffix} />
                </div>
                <div className="text-sm font-semibold text-slate-700">{label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
                <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full w-4/5" style={{ background: accent }} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          AI CHAT PREVIEW
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <SectionPill icon={<Bot size={12} />}>Powered by Advanced AI</SectionPill>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Talk to Your AI Matchmaker</h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
              Ask anything — from funding matches to market insights. Our AI assistant understands
              your needs and provides intelligent recommendations.
            </p>
          </Reveal>

          <Reveal delay={80} className="max-w-2xl mx-auto">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-100">
              {/* Chat header */}
              <div className="px-5 py-4 flex items-center gap-3 bg-hero-gradient">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">AI Matchmaker</p>
                  <p className="text-white/70 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                    Online · Ready to help
                  </p>
                </div>
                <Sparkles size={16} className="text-white/60 ml-auto" />
              </div>

              {/* Messages */}
              <div className="bg-slate-50 px-5 py-5 flex flex-col gap-4 min-h-[240px]">
                {AI_MESSAGES.map((m, i) => (
                  <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.from === 'ai' && (
                      <div className="w-7 h-7 rounded-full mr-2 flex items-center justify-center shrink-0 bg-brand-gradient">
                        <Bot size={13} className="text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                        ${m.from === 'ai'
                          ? 'bg-white text-slate-700 shadow-sm rounded-tl-none'
                          : 'text-white rounded-tr-none bg-brand-gradient'}`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="bg-white border-t border-slate-100 px-4 py-3 flex items-center gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about builders, investors, or projects..."
                  className="flex-1 text-sm text-slate-700 bg-transparent outline-none placeholder-slate-400"
                />
                <button
                  aria-label="Send message"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 bg-brand-gradient transition-transform hover:scale-105 active:scale-95"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

            {/* Feature chips below chat */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {['Smart Matching', 'Real-time Insights', '24/7 Availability', 'Verified Data'].map((f) => (
                <span key={f} className="tag-teal text-xs px-4 py-1.5">{f}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          DISCOVER PREVIEW (Builders / Investors / Projects tabs)
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Discover Opportunities</h2>
              <p className="text-slate-500 text-sm mt-1">Explore verified builders, investors, and projects</p>
            </div>
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white rounded-2xl p-1 shadow-card">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200
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
          <div key={activeTab} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'Builders'  && BUILDERS.slice(0, 3).map((b, i) => <Reveal key={b.id}  delay={i * 80}><BuilderCard  builder={b} /></Reveal>)}
            {activeTab === 'Investors' && INVESTORS.slice(0, 3).map((iv, i) => <Reveal key={iv.id} delay={i * 80}><InvestorCard investor={iv} /></Reveal>)}
            {activeTab === 'Projects'  && PROJECTS.slice(0, 3).map((p, i)  => <Reveal key={p.id}  delay={i * 80}><ProjectCard  project={p} /></Reveal>)}
          </div>

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
              <SectionPill>AI-Powered Intelligence</SectionPill>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              Find Your Perfect Match<br />with AI Precision
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Our advanced AI algorithms analyse project requirements, investment preferences,
              and success patterns to create meaningful connections that drive results.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {AI_FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 100}>
                <div className="card p-6 h-full group">
                  <div className="w-11 h-11 rounded-2xl mb-4 flex items-center justify-center bg-brand-gradient transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Icon size={19} className="text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* CTA block */}
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-200 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to find your ideal partner?</h3>
                <p className="text-slate-600 text-sm max-w-md">
                  Join thousands of verified builders and investors who trust Builder AI Market
                  to create successful partnerships and drive growth.
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-4 shrink-0">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-brand-gradient animate-float">
                  <Sparkles size={28} className="text-white" />
                </div>
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
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              Built on Trust &amp; Transparency
            </h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
              Your security is our priority. We maintain the highest standards of verification,
              compliance, and transparency to ensure safe and successful partnerships.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TRUST.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={(i % 3) * 80}>
                <div className="card p-5 flex gap-4 items-start border border-transparent hover:border-brand-200 h-full">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-brand-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm mb-1">{title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
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
