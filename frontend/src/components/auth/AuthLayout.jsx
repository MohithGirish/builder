/*
 * AuthLayout.jsx — Split-screen shell for the login and registration pages.
 *
 * Renders a premium two-column layout: a branded showcase panel on the left
 * (dark aurora background, logo, headline, feature highlights, and trust
 * stats) that is hidden on small screens, and a right column that hosts the
 * page's form via children. Accepts `headline`, `sub`, and `highlights` to
 * tailor the showcase copy per page. Entrance animations respect reduced motion.
 */
import { Link } from 'react-router-dom';
import { Building2, Sparkles } from 'lucide-react';

const STATS = [
  { value: '45K+',  label: 'Verified Builders' },
  { value: '₹20K Cr', label: 'Invested' },
  { value: '98%',   label: 'Match Success' },
];

export default function AuthLayout({ children, headline, sub, highlights = [] }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Branded showcase (desktop only) ───────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 aurora bg-slate-950 overflow-hidden">
        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-2.5 w-fit group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-gradient transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Building2 size={20} className="text-white" />
          </div>
          <div className="leading-tight">
            <span className="text-xl font-bold text-white">Builder.AI</span>
            <span className="block text-[11px] text-white/50 font-medium -mt-0.5">Market</span>
          </div>
        </Link>

        {/* Headline + highlights */}
        <div className="relative z-10 max-w-md animate-fade-up">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white/90 backdrop-blur mb-6">
            <Sparkles size={12} /> AI-Powered Matchmaking
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-[1.12] mb-5">
            {headline}
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-8">{sub}</p>

          <ul className="space-y-3.5">
            {highlights.map(({ icon: Icon, text }, i) => (
              <li key={text} className="flex items-center gap-3 text-white/85 text-sm animate-fade-up" style={{ animationDelay: `${120 + i * 90}ms` }}>
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-brand-300" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Trust stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-extrabold text-white font-display">{value}</p>
              <p className="text-[11px] text-white/50 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form column ───────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-center py-12 px-4 sm:px-8"
        style={{ background: 'linear-gradient(135deg,#f8fafb 0%,#fff8f3 50%,#f0fdfa 100%)' }}
      >
        <div className="w-full max-w-md animate-fade-up">{children}</div>
      </div>
    </div>
  );
}
