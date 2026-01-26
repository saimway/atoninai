"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { ThemeProvider } from "../contexts/ThemeContext";
import { SidebarProvider } from "../contexts/SidebarContext";
import { ArtifactProvider } from "../contexts/ArtifactContext";
import { SettingsProvider } from "../contexts/SettingsContext";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <ThemeProvider>
      <SettingsProvider>
        <SidebarProvider>
          <ArtifactProvider>
            {/* Global Page Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
              </motion.div>
            </AnimatePresence>
          </ArtifactProvider>
        </SidebarProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
