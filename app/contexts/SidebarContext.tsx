"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("atonin_sidebar_collapsed");
    if (saved) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    localStorage.setItem("atonin_sidebar_collapsed", JSON.stringify(collapsed));
  };

  const toggleCollapse = () => {
    setCollapsed(!isCollapsed);
  };

  // Prevent hydration mismatch by rendering children only after mount,
  // or accept that the initial render might be different.
  // For sidebar state affecting layout, it's better to render consistent with server (expanded)
  // then effect update, OR use a loading state.
  // Here we just render. The layout shift is acceptable for this MVP.

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
