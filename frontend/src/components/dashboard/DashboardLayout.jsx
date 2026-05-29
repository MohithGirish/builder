/*
 * DashboardLayout.jsx — Shared layout shell for all dashboard pages.
 *
 * Renders a full-viewport flex container with a fixed DashboardSidebar on
 * the left and a scrollable main content area on the right. Uses React
 * Router's <Outlet> to render the matched child dashboard route. Used by
 * both the builder (/dashboard) and investor (/investor-dashboard) route groups.
 */
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout() {
  return (
    <div
      className="flex bg-[#f0f6ff]"
      style={{ height: 'calc(100vh - 56px)' }}
    >
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
