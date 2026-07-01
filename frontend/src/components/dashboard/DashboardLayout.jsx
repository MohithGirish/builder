/*
 * DashboardLayout.jsx — Shared layout shell for all dashboard pages.
 *
 * Wraps SidebarProvider so both this layout and DashboardSidebar share collapse/
 * mobile-open state without window.dispatchEvent hacks. Desktop: static sidebar
 * column that collapses from w-56 to w-14. Mobile: fixed Sheet drawer from left,
 * opened by a teal FAB fixed at bottom-left. Uses React Router <Outlet> for the
 * matched child route. Serves /dashboard and /investor-dashboard route groups.
 */
import { PanelLeft } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import { SidebarProvider, useSidebar } from '../../context/SidebarContext';

function LayoutInner() {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div className="flex bg-slate-50 relative h-viewport-minus-nav overflow-hidden">

      {/* Mobile backdrop — closes drawer on tap */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar — static column, width transitions 200ms */}
      <div
        className={[
          'hidden md:flex shrink-0 flex-col overflow-hidden w-56',
          'transition-[max-width] duration-200 ease',
          collapsed ? 'max-w-[3.5rem]' : 'max-w-56',
        ].join(' ')}
      >
        <DashboardSidebar />
      </div>

      {/* Mobile sidebar — fixed Sheet from left */}
      <div
        className={[
          'fixed top-0 left-0 bottom-0 z-40 md:hidden',
          'transition-transform duration-200 ease',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <DashboardSidebar mobile onClose={() => setMobileOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <Outlet />
      </main>

      {/* Mobile FAB — teal, rounded-full, fixed bottom-left */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-5 left-4 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-brand-600 shadow-lg text-white active:scale-95 transition-transform"
        aria-label="Open navigation"
      >
        <PanelLeft size={20} />
      </button>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <LayoutInner />
    </SidebarProvider>
  );
}
