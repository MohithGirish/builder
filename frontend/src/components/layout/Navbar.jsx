/*
 * Navbar.jsx — Sticky top navigation bar for the application.
 *
 * Renders the Builder.AI logo, desktop navigation links (Discover, Builders,
 * Investors, Projects), and an auth-aware right section: unauthenticated users
 * see an "AI Assistant" CTA; authenticated users see a user pill with a
 * dropdown (Dashboard, My Profile, Update Preferences, Sign Out). Includes a
 * responsive mobile hamburger menu. Click-outside detection closes the user
 * dropdown.
 */
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Building2, Sparkles, Menu, X, LayoutDashboard, LogOut, ChevronDown, UserCircle, RefreshCw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { label: 'Discover',  to: '/' },
  { label: 'Builders',  to: '/builders' },
  { label: 'Investors', to: '/investors' },
  { label: 'Projects',  to: '/projects' },
];

export default function Navbar() {
  const [open,     setOpen]     = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();
  const { isAuthenticated, role, onboardingComplete, user, logout } = useAuth();

  const initials = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || '?';
  const dashDest  = role === 'investor' ? '/investor-dashboard' : '/dashboard';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Grow the navbar shadow once the user scrolls past the top
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleAIAssistant() {
    if (isAuthenticated && onboardingComplete) {
      navigate(dashDest);
    } else if (isAuthenticated) {
      navigate('/onboarding');
    } else {
      navigate('/login');
    }
  }

  async function handleLogout() {
    setUserOpen(false);
    setOpen(false);
    await logout();
    navigate('/');
  }

  return (
    <header className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b transition-all duration-300
      ${scrolled ? 'border-slate-200 shadow-soft' : 'border-transparent shadow-none'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-brand-gradient transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
            <Building2 size={15} className="text-white" />
          </div>
          <div className="leading-tight">
            <span className="text-sm font-bold text-slate-800">Builder.AI</span>
            <span className="block text-[10px] text-slate-400 font-medium -mt-0.5">Market</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                 ${isActive ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:text-brand-700 hover:bg-slate-50'}`
              }
            >
              {({ isActive }) => (
                <>
                  {label}
                  {isActive && (
                    <span className="absolute -bottom-px left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-brand-gradient" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right side: logged-out = AI Assistant btn | logged-in = user pill */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserOpen((v) => !v)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 bg-brand-gradient">
                  {initials}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                  {user?.first_name}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-slate-400 transition-transform duration-200 ${userOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {userOpen && (
                <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-lifted border border-slate-100 py-1.5 z-50 origin-top-right animate-slide-down">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setUserOpen(false); navigate(dashDest); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <LayoutDashboard size={13} className="text-brand-600" />
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => { setUserOpen(false); navigate('/profile'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserCircle size={13} className="text-brand-600" />
                    My Profile
                  </button>
                  <button
                    onClick={() => { setUserOpen(false); navigate('/onboarding/retake'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCw size={13} className="text-amber-500" />
                    Update Preferences
                  </button>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={13} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleAIAssistant}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-cta-gradient transition-all hover:-translate-y-0.5 hover:shadow-glow-amber active:translate-y-0 active:scale-95"
            >
              <Sparkles size={14} />
              AI Assistant
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-50"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-1 origin-top animate-slide-down">
          {NAV.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                 ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'}`
              }
            >
              {label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <>
              <button
                onClick={() => { setOpen(false); navigate(dashDest); }}
                className="mt-2 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-brand-700 bg-brand-50"
              >
                <LayoutDashboard size={14} /> Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => { setOpen(false); handleAIAssistant(); }}
              className="mt-2 btn-cta w-full"
            >
              <Sparkles size={14} /> AI Assistant
            </button>
          )}
        </div>
      )}
    </header>
  );
}
