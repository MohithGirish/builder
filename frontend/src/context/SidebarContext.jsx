/*
 * SidebarContext.jsx — Shared context for dashboard sidebar collapse/open state.
 *
 * Provides collapsed (desktop icon-only mode) and mobileOpen (mobile sheet drawer)
 * state, consumed by both DashboardLayout and DashboardSidebar without creating
 * a circular import between those two files.
 */
import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be inside SidebarProvider');
  return ctx;
}
