/*
 * Onboarding.jsx — Role selection screen (post-registration, pre-dashboard).
 *
 * Presents two role cards ("I'm a Builder" / "I'm an Investor") with feature
 * highlights for each. On selection, saves the chosen role to AuthContext via
 * setOnboardingRole() and navigates to the OnboardingChat questionnaire.
 * This page is only accessible to authenticated users who have not yet
 * completed onboarding.
 */
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Briefcase, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BUILDER_PERKS = [
  'List unlimited projects',
  'AI-powered investor matching',
  'Secure dealroom & analytics',
  'Verified builder badge',
];

const INVESTOR_PERKS = [
  'Access 10,000+ verified projects',
  'AI-powered builder recommendations',
  'Portfolio analytics & ROI tracking',
  'Direct builder communication',
];

export default function Onboarding() {
  const { setOnboardingRole } = useAuth();
  const navigate = useNavigate();

  function handleSelect(role) {
    setOnboardingRole(role);
    navigate('/onboarding/chat');
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-12 px-4"
      style={{ background: 'linear-gradient(160deg,#fdf6ee 0%,#fef9f5 60%,#f7fdf9 100%)' }}
    >
      {/* AI Powered pill */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-500 mb-6">
        <Sparkles size={12} className="text-brand-600" />
        AI-Powered Matchmaking
      </div>

      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-700 text-center mb-3">
        👋 Namaste! Welcome to Builder.AI Market
      </h1>
      <p className="text-base text-slate-500 text-center max-w-2xl leading-relaxed mb-2">
        I'm your AI guide. Tell me a bit about your goals — are you building, funding, or exploring
        opportunities in India's booming real-estate and infrastructure sector?
      </p>
      <p className="text-sm text-slate-400 mb-10">Select your role to get started</p>

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mb-10">

        {/* ── Builder card ── */}
        <div className="bg-white rounded-2xl p-7 border-2 border-orange-400 shadow-sm flex flex-col">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg,#f97316,#f59e0b)' }}
          >
            <Briefcase size={22} className="text-white" />
          </div>

          <h2 className="text-lg font-semibold text-slate-800 mb-2">I'm a Builder</h2>
          <p className="text-sm text-slate-500 mb-5 leading-relaxed">
            List verified projects, connect with global investors, and secure funding for your
            real-estate and infrastructure developments.
          </p>

          <ul className="space-y-2.5 mb-5">
            {BUILDER_PERKS.map(p => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                {p}
              </li>
            ))}
          </ul>

          <p className="text-xs font-semibold text-orange-500 mb-5">45,000+ Builders Trust Us</p>

          <button
            onClick={() => handleSelect('builder')}
            className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 hover:shadow-md active:scale-[0.99]"
            style={{ background: 'linear-gradient(to right,#f97316,#f59e0b)' }}
          >
            Get Started as Builder <ArrowRight size={16} />
          </button>
        </div>

        {/* ── Investor card ── */}
        <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex flex-col hover:border-sky-300 transition-colors">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg,#1e88e5,#42a5f5)' }}
          >
            <TrendingUp size={22} className="text-white" />
          </div>

          <h2 className="text-lg font-semibold text-slate-800 mb-2">I'm an Investor</h2>
          <p className="text-sm text-slate-500 mb-5 leading-relaxed">
            Discover verified builders and high-potential projects across India. Make data-driven
            investment decisions with AI insights.
          </p>

          <ul className="space-y-2.5 mb-5">
            {INVESTOR_PERKS.map(p => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                {p}
              </li>
            ))}
          </ul>

          <p className="text-xs font-semibold text-sky-600 mb-5">₹25,000+ Cr Invested Through Platform</p>

          <button
            onClick={() => handleSelect('investor')}
            className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 hover:shadow-md active:scale-[0.99]"
            style={{ background: 'linear-gradient(135deg,#1e88e5,#0369a1)' }}
          >
            Get Started as Investor <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Trust footer */}
      <p className="text-xs text-slate-400">
        Trusted by 45,000+ Builders and 8,500+ Investors across India
      </p>
    </div>
  );
}
