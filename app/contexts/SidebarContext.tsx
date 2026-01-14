"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('atonin_sidebar_collapsed');
    if (saved) {
      setIsCollapsed(JSON.parse(saved));
    }
    setIsInitialized(true);
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('atonin_sidebar_collapsed', JSON.stringify(newState));
  };

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    localStorage.setItem('atonin_sidebar_collapsed', JSON.stringify(collapsed));
  };

  // Prevent flash of wrong layout by rendering children only after checking localStorage?
  // Or just default to expanded (false).
  // If we wait, we might delay the app. Better to just render.

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
