/*
 * Onboarding.jsx — Role selection screen (post-registration, pre-dashboard).
 *
 * Full-viewport 50/50 CSS grid: Builder half (teal gradient) left, Investor
 * half (slate gradient) right. Each half has a large icon, role name, 4 perks
 * as a checkmark list, and an inner card (bg-white/10 rounded-2xl). On hover
 * the inner card scales to 1.02. On selection: white ring-4 on the selected
 * half's card, other half fades to opacity-60. "Continue →" button slides in
 * from bottom after selection. Mobile stacks vertically, each half min-h-[260px].
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, TrendingUp, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
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

function RoleHalf({ role, icon: Icon, title, description, perks, gradient, selected, dimmed, onSelect }) {
  function handleKey(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Select ${title} role`}
      className={`relative flex items-center justify-center p-8 min-h-[260px] transition-opacity duration-200 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 ${
        dimmed ? 'opacity-60' : 'opacity-100'
      }`}
      style={{ background: gradient }}
      onClick={onSelect}
      onKeyDown={handleKey}
    >
      {/* Inner card */}
      <div
        className={`w-full max-w-sm rounded-2xl p-7 transition-all duration-200 ${
          selected
            ? 'ring-4 ring-white ring-offset-4 ring-offset-transparent scale-[1.02]'
            : 'scale-100 hover:scale-[1.02]'
        }`}
        style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
      >
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
          <Icon size={28} className="text-white" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-sm text-white/75 mb-5 leading-relaxed">{description}</p>

        {/* Perks */}
        <ul className="space-y-2.5">
          {perks.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm text-white/90">
              <CheckCircle2 size={15} className="text-white/70 shrink-0 mt-0.5" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const { setOnboardingRole } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);

  async function handleContinue() {
    if (!selected) return;
    setLoading(true);
    setOnboardingRole(selected);
    navigate('/onboarding/chat');
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 50/50 grid: stacks on mobile */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2">
        <RoleHalf
          role="builder"
          icon={Wrench}
          title="I'm a Builder"
          description="List verified projects, connect with global investors, and secure funding."
          perks={BUILDER_PERKS}
          gradient="linear-gradient(135deg, #0d9488 0%, #0f766e 100%)"
          selected={selected === 'builder'}
          dimmed={selected === 'investor'}
          onSelect={() => setSelected('builder')}
        />
        <RoleHalf
          role="investor"
          icon={TrendingUp}
          title="I'm an Investor"
          description="Discover verified builders and high-potential projects across India."
          perks={INVESTOR_PERKS}
          gradient="linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
          selected={selected === 'investor'}
          dimmed={selected === 'builder'}
          onSelect={() => setSelected('investor')}
        />
      </div>

      {/* Continue button — slides in after role is selected */}
      <div
        className={`border-t border-slate-100 bg-white px-6 py-5 transition-all duration-300 ${
          selected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="max-w-sm mx-auto">
          <button
            onClick={handleContinue}
            disabled={!selected || loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-60"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Loading…</>
              : <>Continue as {selected === 'builder' ? 'Builder' : 'Investor'} <ArrowRight size={16} /></>
            }
          </button>
          <p className="text-center text-xs text-slate-400 mt-3">
            You can change your role later in Settings
          </p>
        </div>
      </div>
    </div>
  );
}
