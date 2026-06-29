/*
 * Footer.jsx — Global site footer component.
 *
 * Renders a three-column dark footer with the Builder.AI brand (logo, tagline,
 * contact info), Builders links, and Investors links. Every link navigates to a
 * real, functional destination: actions requiring auth send logged-out users to
 * /login (preserving the intended path so login forwards them on), and the
 * "Join as Builder/Investor" links prompt a role switch when the signed-in user
 * holds the opposite role. The bottom bar shows the copyright. Displayed on all
 * public pages; hidden on dashboard, dealroom, auth, and onboarding pages via
 * route-conditional rendering in App.jsx.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Mail, MapPin, Globe,
  ArrowRightLeft, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandMark } from '../CompatibilityInstrument';

export default function Footer() {
  const navigate = useNavigate();
  const { isAuthenticated, role, switchRole, setOnboardingRole } = useAuth();

  // Pending role-switch target shown in the confirmation modal (null = closed)
  const [switchTo, setSwitchTo] = useState(null);

  const dashHome = () => (role === 'investor' ? '/investor-dashboard' : '/dashboard');

  /**
   * Navigate to `dest`. If `requireAuth` and the user is logged out, route them
   * to /login first while remembering `dest` so login forwards them afterward.
   */
  function go(dest, { requireAuth = true } = {}) {
    if (requireAuth && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: dest } } });
      return;
    }
    navigate(dest);
  }

  /**
   * Handle a "Join as <role>" link. Logged-out users are sent through login and
   * onboarding for that role. A signed-in user already in that role goes to
   * their dashboard; one in the opposite role is asked to confirm a switch.
   */
  function joinAs(targetRole) {
    if (!isAuthenticated) {
      // After login, ProtectedRoute funnels new users into onboarding for their role
      navigate('/login', { state: { from: { pathname: dashHome() } } });
      return;
    }
    if (role === targetRole) {
      navigate(dashHome());
      return;
    }
    setSwitchTo(targetRole);
  }

  function confirmSwitch() {
    const target = switchTo;
    setSwitchTo(null);
    switchRole(target);
    setOnboardingRole(target);
    // Go straight to the new role's preference questions (no role picker).
    navigate('/onboarding/retake');
  }

  // Link descriptors — every entry navigates to a real, functional destination.
  const BUILDER_LINKS = [
    { label: 'Join as Builder', onClick: () => joinAs('builder') },
    { label: 'List Projects',   onClick: () => go('/dashboard/projects') },
  ];

  const INV_LINKS = [
    { label: 'Join as Investor',    onClick: () => joinAs('investor') },
    { label: 'Browse Projects',     onClick: () => go('/projects', { requireAuth: false }) },
    { label: 'Analytics Dashboard', onClick: () => go(`${dashHome()}/analytics`) },
  ];

  const linkClass = 'text-sm text-slate-400 hover:text-azure transition-colors text-left';
  const colHeading = 'font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300 mb-4';

  return (
    <footer className="relative bg-ink text-slate-300">
      {/* Brass hairline — the single warm accent on the dark surface */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brass to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">

        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4 w-fit">
            <BrandMark heights={[7, 11, 17, 14, 10]} onDark className="h-[18px]" />
            <span className="text-white font-bold text-base">Builder</span>
            <span className="text-azure font-bold text-base">.AI</span>
            <span className="text-xs text-slate-400 font-medium ml-0.5">Market</span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed mb-5">
            India's premier AI-powered platform connecting verified builders and investors for
            real-estate, infrastructure, and venture projects.
          </p>
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex items-center gap-2"><Mail size={14} /><a href="mailto:contact@layeredai.us" className="hover:text-azure transition-colors">contact@layeredai.us</a></div>
            <div className="flex items-center gap-2"><Globe size={14} /><a href="https://layeredai.us/" target="_blank" rel="noopener noreferrer" className="hover:text-azure transition-colors">layeredai.us</a></div>
            <div className="flex items-center gap-2"><MapPin size={14} /><span>Mumbai, India</span></div>
          </div>
        </div>

        {/* Builders */}
        <div>
          <h4 className={colHeading}>Builders</h4>
          <ul className="space-y-2">
            {BUILDER_LINKS.map((l) => (
              <li key={l.label}>
                <button type="button" onClick={l.onClick} className={linkClass}>{l.label}</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Investors */}
        <div>
          <h4 className={colHeading}>Investors</h4>
          <ul className="space-y-2">
            {INV_LINKS.map((l) => (
              <li key={l.label}>
                <button type="button" onClick={l.onClick} className={linkClass}>{l.label}</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-center gap-2">
          <BrandMark heights={[5, 8, 12, 10, 7]} onDark className="h-3" />
          <p className="font-mono text-[11px] text-slate-500 tracking-wide">
            © 2026 BUILDER AI MARKET · MUMBAI · IN
          </p>
        </div>
      </div>

      {/* Role-switch confirmation modal */}
      {switchTo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-lifted p-6 text-slate-800 animate-slide-down">
            <button
              type="button"
              onClick={() => setSwitchTo(null)}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="w-11 h-11 rounded-full bg-brass/10 flex items-center justify-center mb-4">
              <ArrowRightLeft size={20} className="text-brass-700" />
            </div>
            <h3 className="text-lg font-bold mb-1.5">
              Switch to {switchTo === 'investor' ? 'Investor' : 'Builder'}?
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              You're currently signed in as a {role === 'investor' ? 'n Investor' : ' Builder'}.
              Switching will reset your preferences and walk you through a quick onboarding for
              your new role.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSwitchTo(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSwitch}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-cta-gradient hover:-translate-y-0.5 hover:shadow-glow-amber transition-all"
              >
                Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
