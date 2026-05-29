/*
 * DashboardSidebar.jsx — Role-aware navigation sidebar for dashboard pages.
 *
 * Renders the user's avatar, name, company, and verified badge at the top,
 * followed by a role-specific navigation menu (BUILDER_NAV or INVESTOR_NAV)
 * with active-state styling and unread-count badges for the Dealroom and
 * Builder Matches links. Includes a sign-out button at the bottom that calls
 * AuthContext.logout() and redirects to /login.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Users, MessageSquare,
  BarChart3, Wallet, List, Star, CheckCircle2, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_DEALROOMS } from '../../data/dealrooms';

const BUILDER_NAV = [
  { label: 'Dashboard',        to: '/dashboard',           icon: LayoutDashboard },
  { label: 'My Projects',      to: '/dashboard/projects',  icon: FolderKanban },
  { label: 'Investor Matches', to: '/dashboard/matches',   icon: Star },
  { label: 'Dealroom',         to: '/dealroom',            icon: MessageSquare, badge: true },
  { label: 'Analytics',        to: '/dashboard/analytics', icon: BarChart3 },
];

const INVESTOR_NAV = [
  { label: 'Dashboard',       to: '/investor-dashboard',             icon: LayoutDashboard },
  { label: 'My Investments',  to: '/investor-dashboard/investments', icon: Wallet },
  { label: 'Builder Matches', to: '/investor-dashboard/matches',     icon: Users, badge: true },
  { label: 'Builders Feed',   to: '/investor-dashboard/feed',        icon: List },
  { label: 'Dealroom',        to: '/dealroom',                       icon: MessageSquare, badge: true },
  { label: 'Analytics',       to: '/investor-dashboard/analytics',   icon: BarChart3 },
];

export default function DashboardSidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const nav = role === 'builder' ? BUILDER_NAV : INVESTOR_NAV;

  const totalUnread = MOCK_DEALROOMS.reduce((s, d) => s + d.unread_count, 0);
  const matchCount  = role === 'investor' ? 7 : 0;

  const initials = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || '?';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <aside className="w-52 shrink-0 flex flex-col bg-white border-r border-slate-100 h-full overflow-y-auto">

      {/* ── User info ─────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-4 border-b border-slate-100">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white bg-brand-gradient shadow-sm">
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[160px]">
              {user?.company || (role === 'investor' ? 'VC Firm' : 'Builder')}
            </p>
            {user?.is_verified && (
              <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white bg-brand-gradient">
                <CheckCircle2 size={9} />
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Nav items ─────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {nav.map(({ label, to, icon: Icon, badge }) => {
          const count = badge && label === 'Dealroom'
            ? totalUnread
            : badge && label === 'Builder Matches'
            ? matchCount
            : 0;

          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard' || to === '/investor-dashboard'}
              className={({ isActive }) =>
                `relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white shadow-sm bg-cta-gradient'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:translate-x-0.5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-white/70" />}
                  <Icon size={15} className="shrink-0" />
                  <span className="flex-1">{label}</span>
                  {count > 0 && (
                    <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center bg-white text-orange-600">
                      {count}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Sign out ───────────────────────────────────────────── */}
      <div className="px-3 pb-4 pt-2 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-colors"
        >
          <LogOut size={13} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
