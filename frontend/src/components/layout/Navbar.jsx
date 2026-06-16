/*
 * Navbar.jsx — Sticky top navigation bar.
 *
 * Logo: "Builder" font-bold slate-900 + ".AI" teal-600, text-only, no icon.
 * Desktop: NavLinks with 2 px bottom-border teal-600 on active (no pill bg).
 * Logged out: "Get Started" rounded-full btn-brand. Logged in: avatar + chevron
 * dropdown (Dashboard, Profile, Sign Out). Mobile: Sheet from RIGHT (left is
 * reserved for the sidebar FAB); hamburger opens it, closes on any link click.
 * Scroll: adds border-b + backdrop-blur-md after 8 px scroll. No window events.
 */
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, ChevronDown, UserCircle, RefreshCw, LayoutDashboard } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();
  const { isAuthenticated, role, user, logout } = useAuth();

  const initials  = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || '?';
  const dashDest  = role === 'investor' ? '/investor-dashboard' : '/dashboard';

  /* Close dropdown on outside click */
  useEffect(() => {
    function outside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setUserOpen(false);
    }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  /* Scroll detector */
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function handleLogout() {
    setUserOpen(false);
    setMobileOpen(false);
    await logout();
    navigate('/');
  }

  const navItems = [
    { label: 'Discover',  to: '/' },
    ...(isAuthenticated ? [{ label: 'Dashboard', to: dashDest }] : []),
    { label: 'Builders',  to: '/builders' },
    { label: 'Investors', to: '/investors' },
    { label: 'Projects',  to: '/projects' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white/90 transition-all duration-200 ${
          scrolled
            ? 'border-b border-slate-100/80 backdrop-blur-md shadow-none'
            : 'border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              Builder<span className="text-teal-600">.AI</span>
            </span>
          </Link>

          {/* Desktop nav — centered */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navItems.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/' || to === dashDest}
                className={({ isActive }) =>
                  `relative px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-slate-900'
                      : 'text-slate-500 hover:text-slate-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {/* 2 px teal underline on active — not a pill */}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-teal-600" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-brand-gradient shrink-0">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[90px] truncate">
                    {user?.first_name}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`text-slate-400 transition-transform duration-200 ${userOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {userOpen && (
                  <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-lifted border border-slate-100 py-1.5 z-50 animate-slide-down">
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
                      <LayoutDashboard size={13} className="text-teal-600" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => { setUserOpen(false); navigate('/profile'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <UserCircle size={13} className="text-teal-600" />
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
                onClick={() => navigate('/register')}
                className="btn-brand px-5 py-1.5 text-sm rounded-full"
              >
                Get Started
              </button>
            )}
          </div>

          {/* Mobile hamburger — right side, Sheet slides from RIGHT */}
          <button
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Sheet — slides from RIGHT (left is sidebar FAB territory) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" id="mobile-nav" role="dialog" aria-modal="true" aria-label="Navigation menu">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel from right */}
          <div className="w-72 bg-white h-full flex flex-col shadow-lifted animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-900">
                Builder<span className="text-teal-600">.AI</span>
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
              {navItems.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/' || to === dashDest}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Auth at bottom */}
            <div className="px-4 pb-6 border-t border-slate-100 pt-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 mb-4 px-1">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white bg-brand-gradient shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setMobileOpen(false); navigate('/login'); }}
                    className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => { setMobileOpen(false); navigate('/register'); }}
                    className="btn-brand w-full py-2.5 text-sm"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
