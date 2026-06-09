/*
 * DashboardLayout.jsx — Shared layout shell for all dashboard pages.
 *
 * Renders a full-viewport flex container with a fixed DashboardSidebar on
 * the left and a scrollable main content area on the right. On mobile (<md)
 * the sidebar hides off-screen and slides in as a drawer when the hamburger
 * FAB is tapped; a backdrop overlay closes it on outside-click. Uses React
 * Router's <Outlet> to render the matched child route. Used by both builder
 * (/dashboard) and investor (/investor-dashboard) route groups.
 */
import { useState, useEffect } from 'react';
import { PanelLeft } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close this drawer when the navbar mobile menu signals it is opening
  useEffect(() => {
    const handler = () => setSidebarOpen(false);
    window.addEventListener('builderai:close-sidebar', handler);
    return () => window.removeEventListener('builderai:close-sidebar', handler);
  }, []);

  function openSidebar() {
    window.dispatchEvent(new CustomEvent('builderai:close-navbar'));
    setSidebarOpen(true);
  }

  return (
    <div
      className="flex bg-[#f0f6ff] relative"
      style={{ height: 'calc(100vh - 56px)' }}
    >
      {/* Mobile backdrop — closes drawer on tap */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar wrapper — drawer on mobile, static column on md+ */}
      <div
        className={[
          'fixed md:static',
          'top-[56px] md:top-auto',
          'left-0',
          'bottom-0 md:bottom-auto',
          'md:h-full',
          'z-40 md:z-auto',
          'transition-transform duration-300 ease-in-out md:transition-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <DashboardSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <Outlet />
      </main>

      {/* Mobile hamburger FAB — only visible on mobile, behind drawer backdrop */}
      <button
        onClick={openSidebar}
        className="md:hidden fixed bottom-5 left-4 z-20 p-3 rounded-2xl bg-white shadow-lg border border-slate-200 text-slate-600 active:scale-95 transition-transform"
        aria-label="Open navigation"
      >
        <PanelLeft size={20} />
      </button>
    </div>
  );
}
