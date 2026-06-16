/*
 * Footer.jsx — Global site footer component.
 *
 * Renders a four-column dark footer with the Builder.AI brand (logo, tagline,
 * contact info), Company links, Builders links, and Investors links. Every link
 * is wired to a real destination: actions requiring auth send logged-out users
 * to /login (preserving the intended path so login forwards them on), and the
 * "Join as Builder/Investor" links prompt a role switch when the signed-in user
 * holds the opposite role. The bottom bar shows the copyright and social links.
 * Displayed on all public pages; hidden on dashboard, dealroom, auth, and
 * onboarding pages via route-conditional rendering in App.jsx.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Mail, MapPin, Globe, Linkedin, Twitter, Instagram, Heart,
  ArrowRightLeft, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
    navigate('/onboarding/chat');
  }

  // Link descriptors: [label, handler]. Plain public links use a string href.
  const COMPANY = [
    { label: 'About Us',      to: '/' },
    { label: 'Contact',       to: '/' },
    { label: 'Privacy Policy', to: '/' },
    { label: 'Careers',       to: '/' },
  ];

  const BUILDER_LINKS = [
    { label: 'Join as Builder',  onClick: () => joinAs('builder') },
    { label: 'List Projects',    onClick: () => go('/dashboard/projects') },
    { label: 'Get Verified',     onClick: () => go('/profile') },
    { label: 'Success Stories',  onClick: () => go('/projects', { requireAuth: false }) },
  ];

  const INV_LINKS = [
    { label: 'Join as Investor',   onClick: () => joinAs('investor') },
    { label: 'Browse Projects',    onClick: () => go('/projects', { requireAuth: false }) },
    { label: 'Analytics Dashboard', onClick: () => go(`${dashHome()}/analytics`) },
    { label: 'FAQ',                onClick: () => go('/', { requireAuth: false }) },
  ];

  const linkClass = 'text-sm text-slate-400 hover:text-brand-400 transition-colors text-left';

  return (
    <footer className="relative bg-slate-900 text-slate-300">
      {/* Top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-600 via-teal-500 to-teal-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-1.5 mb-4 w-fit">
            <span className="text-white font-bold text-base">Builder</span>
            <span className="text-teal-400 font-bold text-base">.AI</span>
            <span className="text-xs text-slate-400 font-medium ml-0.5">Market</span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed mb-5">
            India's premier AI-powered platform connecting verified builders and investors for
            real-estate, infrastructure, and venture projects.
          </p>
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex items-center gap-2"><Mail size={14} /><span>contact@layeredai.us</span></div>
            <div className="flex items-center gap-2"><Globe size={14} /><a href="https://layeredai.us/" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">layeredai.us</a></div>
            <div className="flex items-center gap-2"><MapPin size={14} /><span>Mumbai, India</span></div>
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
          <ul className="space-y-2">
            {COMPANY.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className={linkClass}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Builders */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Builders</h4>
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
          <h4 className="text-white font-semibold text-sm mb-4">Investors</h4>
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
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            © 2026 Builder AI Market · Made with
            <Heart size={11} className="text-red-400 fill-red-400" />
            in India
          </p>
          <div className="flex items-center gap-3">
            {[
              { Icon: Linkedin,  label: 'LinkedIn' },
              { Icon: Twitter,   label: 'Twitter' },
              { Icon: Instagram, label: 'Instagram' },
            ].map(({ Icon, label }) => (
              <a key={label} href="#" aria-label={label} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand-600 hover:-translate-y-0.5 transition-all">
                <Icon size={14} />
              </a>
            ))}
          </div>
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
            <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <ArrowRightLeft size={20} className="text-amber-500" />
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
