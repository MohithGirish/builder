/*
 * Onboarding.jsx — Role selection screen (post-registration, pre-dashboard).
 *
 * Blueprint Index dark scene (ink-navy + aurora + dot grid) sitting below the
 * navbar. Centered heading over two selectable glass cards (Builder / Investor)
 * in a radiogroup: each shows an icon tile, mono role tag, name, blurb, and a
 * perk list. The selected card lights up with a steel ring + azure glow and a
 * check; the single brass CTA ("Continue") enables once a role is chosen.
 * Keyboard-operable (Enter/Space) and reduced-motion safe.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, TrendingUp, CheckCircle2, ArrowRight, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  {
    id: 'builder',
    icon: Wrench,
    tag: 'FOR BUILDERS',
    title: "I'm a Builder",
    description: 'List verified projects, connect with global investors, and secure funding.',
    perks: [
      'List unlimited projects',
      'AI-powered investor matching',
      'Secure dealroom & analytics',
      'Verified builder badge',
    ],
  },
  {
    id: 'investor',
    icon: TrendingUp,
    tag: 'FOR INVESTORS',
    title: "I'm an Investor",
    description: 'Discover verified builders and high-potential projects across India.',
    perks: [
      'Access 10,000+ verified projects',
      'AI-powered builder recommendations',
      'Portfolio analytics & ROI tracking',
      'Direct builder communication',
    ],
  },
];

function RoleCard({ role, selected, onSelect }) {
  const { icon: Icon } = role;

  function handleKey(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); }
  }

  return (
    <div
      role="radio"
      tabIndex={0}
      aria-checked={selected}
      aria-label={`Select ${role.title} role`}
      onClick={onSelect}
      onKeyDown={handleKey}
      className={`group relative rounded-2xl p-7 cursor-pointer backdrop-blur transition-all duration-200 ${
        selected
          ? 'bg-white/[0.07] ring-2 ring-brand-400 shadow-glow -translate-y-1'
          : 'bg-white/[0.04] ring-1 ring-white/10 hover:ring-white/25 hover:-translate-y-1'
      }`}
    >
      {/* Selected check */}
      <span
        className={`absolute top-5 right-5 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center transition-all duration-200 ${
          selected ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        <Check size={14} className="text-white" strokeWidth={3} />
      </span>

      {/* Icon tile */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors ${
          selected ? 'bg-brand-gradient' : 'bg-white/10 group-hover:bg-white/[0.15]'
        }`}
      >
        <Icon size={22} className="text-white" />
      </div>

      <p className="font-mono text-[11px] tracking-[0.18em] text-brand-300 mb-2">{role.tag}</p>
      <h2 className="text-xl font-bold text-white mb-2">{role.title}</h2>
      <p className="text-sm text-white/60 leading-relaxed mb-5">{role.description}</p>

      <ul className="space-y-2.5">
        {role.perks.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-sm text-white/80">
            <CheckCircle2 size={15} className="text-brand-300 shrink-0 mt-0.5" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Onboarding() {
  const { setOnboardingRole } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);

  function handleContinue() {
    if (!selected) return;
    setLoading(true);
    setOnboardingRole(selected);
    navigate('/onboarding/chat');
  }

  return (
    <div className="relative aurora bg-ink min-h-[calc(100dvh-56px)] flex items-center justify-center overflow-hidden px-4 py-12">
      {/* Blueprint dot texture */}
      <div className="absolute inset-0 hero-dot-grid opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl animate-fade-up">
        {/* Heading */}
        <div className="text-center mb-9">
          <p className="font-mono text-[11px] tracking-[0.22em] text-brand-300 mb-3">01 — GET STARTED</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">How will you use Builder.AI?</h1>
          <p className="text-sm text-white/60 max-w-md mx-auto">
            Pick the experience that fits you — we'll tailor your matches and dashboard around it.
          </p>
        </div>

        {/* Role cards */}
        <div role="radiogroup" aria-label="Choose your role" className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {ROLES.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              selected={selected === role.id}
              onSelect={() => setSelected(role.id)}
            />
          ))}
        </div>

        {/* Continue — single brass CTA, enables on selection */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={handleContinue}
            disabled={!selected || loading}
            className="btn-cta w-full max-w-xs py-3.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Loading…</>
              : <>Continue{selected ? ` as ${selected === 'builder' ? 'Builder' : 'Investor'}` : ''} <ArrowRight size={16} /></>
            }
          </button>
          <p className="text-xs text-white/40">You can change your role later in your profile.</p>
        </div>
      </div>
    </div>
  );
}
