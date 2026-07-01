/*
 * DashboardSidebar.jsx — Collapsible role-aware navigation sidebar.
 *
 * Desktop: toggles between w-56 (full labels) and w-14 (icon-only with CSS
 * tooltips). Mobile: rendered as a full Sheet (no width constraint). Active
 * item shows a 3 px left teal accent border + bg-teal-50. Collapse toggle at
 * bottom uses ChevronLeft that rotates 180° when collapsed. No window events.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Users, MessageSquare,
  BarChart3, Wallet, List, Star, CheckCircle2, LogOut, ChevronLeft, FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { MOCK_DEALROOMS } from '../../data/dealrooms';
import { INVESTOR_LEADS } from '../../data/dashboard';
import { PROJECT_MATCHES } from '../../data/realProjects';

const BUILDER_NAV = [
  { label: 'Dashboard',        to: '/dashboard',           icon: LayoutDashboard },
  { label: 'My Projects',      to: '/dashboard/projects',  icon: FolderKanban },
  { label: 'Quote Requests',   to: '/dashboard/quote-requests', icon: FileText },
  { label: 'Investor Matches', to: '/dashboard/matches',   icon: Star },
  { label: 'Dealroom',         to: '/dashboard/dealroom',  icon: MessageSquare, badge: true },
  { label: 'Analytics',        to: '/dashboard/analytics', icon: BarChart3 },
];

const INVESTOR_NAV = [
  { label: 'Dashboard',       to: '/investor-dashboard',             icon: LayoutDashboard },
  { label: 'My Quotes',       to: '/investor-dashboard/investments', icon: Wallet },
  { label: 'Project Matches', to: '/investor-dashboard/matches',     icon: Users, badge: true },
  { label: 'Builders Feed',   to: '/investor-dashboard/feed',        icon: List },
  { label: 'Dealroom',        to: '/investor-dashboard/dealroom',    icon: MessageSquare, badge: true },
  { label: 'Analytics',       to: '/investor-dashboard/analytics',   icon: BarChart3 },
];

export default function DashboardSidebar({ mobile = false, onClose }) {
  const { user, role, logout } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();
  const navigate = useNavigate();
  const nav = role === 'builder' ? BUILDER_NAV : INVESTOR_NAV;

  // In mobile mode never collapse — always show full labels
  const isCollapsed = !mobile && collapsed;

  const totalUnread = MOCK_DEALROOMS.reduce((s, d) => s + (d.unread_count || 0), 0);
  const matchCount  = role === 'investor' ? PROJECT_MATCHES.length : INVESTOR_LEADS.length;

  const initials = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || '?';

  async function handleLogout() {
    onClose?.();
    await logout();
    navigate('/login');
  }

  return (
    <aside
      className={[
        'flex flex-col bg-white border-r border-slate-100 h-full overflow-hidden',
        // Mobile always w-64, desktop transitions via parent wrapper
        mobile ? 'w-64' : 'w-full',
      ].join(' ')}
    >
      {/* ── User info ─────────────────────────────────────────── */}
      <div className={`border-b border-slate-100 ${isCollapsed ? 'px-2 pt-4 pb-3 flex justify-center' : 'px-4 pt-5 pb-4'}`}>
        {isCollapsed ? (
          /* Collapsed: avatar only */
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white bg-brand-gradient shadow-sm">
            {initials}
          </div>
        ) : (
          /* Expanded: avatar + name + role badge */
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white bg-brand-gradient shadow-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 leading-tight truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mt-0.5">
                {role === 'investor' ? 'Investor' : 'Builder'}
              </p>
              {user?.is_verified && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-semibold text-white bg-brand-gradient">
                  <CheckCircle2 size={8} /> Verified
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Nav items ─────────────────────────────────────────── */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {nav.map(({ label, to, icon: Icon, badge }) => {
          const count = badge && label === 'Dealroom'
            ? totalUnread
            : badge && (label === 'Builder Matches' || label === 'Investor Matches')
            ? matchCount
            : 0;

          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard' || to === '/investor-dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'relative flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isCollapsed ? 'px-0 py-2 justify-center' : 'px-3 py-2',
                  isActive
                    ? 'text-slate-900 bg-brand-50 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {/* Icon — with CSS tooltip in collapsed mode */}
                  <span className="relative group/tip flex items-center justify-center">
                    <Icon
                      size={16}
                      className={`shrink-0 ${isActive ? 'text-teal-600' : 'text-slate-400 group-hover/tip:text-slate-600'}`}
                    />
                    {/* Tooltip: only visible when collapsed + desktop */}
                    {isCollapsed && (
                      <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-white whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50 shadow-lg">
                        {label}
                        {count > 0 && ` (${count})`}
                      </span>
                    )}
                  </span>

                  {/* Label + badge (hidden when collapsed) */}
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate">{label}</span>
                      {count > 0 && (
                        <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center bg-teal-600 text-white shrink-0">
                          {count}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Collapse toggle (desktop only) ────────────────────── */}
      {!mobile && (
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden md:flex items-center justify-center p-2.5 border-t border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            size={16}
            className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {/* ── Sign out ───────────────────────────────────────────── */}
      <div className={`border-t border-slate-100 ${isCollapsed ? 'px-2 py-3 flex justify-center' : 'px-3 pb-4 pt-2'}`}>
        {isCollapsed ? (
          <span className="relative group/tip">
            <button
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" /* impeccable-disable gray-on-color — hover: transitions icon to red-500 simultaneously with bg-red-50 */
              aria-label="Sign out"
            >
              <LogOut size={15} />
            </button>
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-white whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50 shadow-lg">
              Sign Out
            </span>
          </span>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-colors" /* impeccable-disable gray-on-color — hover: transitions text to red-600 simultaneously with bg-red-50 */
          >
            <LogOut size={13} />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
