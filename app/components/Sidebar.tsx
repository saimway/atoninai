"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SidebarItem } from './SidebarItem';
import { MessageSquare, Hammer, Settings, Menu, X, Plus } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { ChatThread } from '@/app/hooks/useLocalStorage';

interface SidebarProps {
  chatHistory: ChatThread[];
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ chatHistory, onSelectChat, onNewChat, isMobile, isOpen, setIsOpen }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const sidebarVariants = {
    open: { width: "260px", x: 0 },
    collapsed: { width: "80px", x: 0 },
    mobileClosed: { x: "-100%" },
    mobileOpen: { x: 0, width: "280px" },
  };

  const currentVariant = isMobile
    ? (isOpen ? 'mobileOpen' : 'mobileClosed')
    : (isCollapsed ? 'collapsed' : 'open');

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.div
        initial={false}
        animate={currentVariant}
        variants={sidebarVariants}
        // Use z-40 for Sidebar, so elements in main content with z-50 can overlay if needed (though usually sidebar is top)
        // However, the issue is overlap. The Sidebar is FIXED left.
        // If the main content is offset by margin, they shouldn't overlap.
        // But the error says: "subtree intercepts pointer events"
        // <div class="fixed left-0 top-0 h-full bg-card border-r border-border z-50 flex flex-col">
        // intercepts click on <button ...>Atonin V1</button>
        // This implies the Sidebar is covering the main content?
        // Ah, on Desktop, the Sidebar is fixed. The main content has a margin.
        // But if the screen width in Playwright (1920) makes them overlap? No.
        // Wait, "subtree intercepts pointer events" -> means the element clicked is BEHIND the sidebar div.
        // If the sidebar is collapsed (80px) or expanded (260px), and main content has margin, it should be fine.
        // UNLESS the verification script logic is clicking something that is visually under the sidebar?
        // Or if the Sidebar width logic in JS didn't trigger correctly and it's expanded but margin is for collapsed?
        // The error log shows:
        // <div class="p-4 flex items-center justify-between border-b border-border"> from Sidebar
        // intercepts click on ModelSelector.
        // This means the Sidebar HEADER is covering the Top Bar?
        // The Sidebar header is inside the fixed sidebar.
        // If the sidebar z-index is 50, and Top Bar is z-30, Sidebar wins.
        // If they overlap physically, Sidebar wins.
        // They should NOT overlap physically on Desktop if margin is correct.
        // CSS: .main-content { margin-left: 80px; }
        // If Sidebar is expanded (260px), margin should be 260px?
        // I used style jsx in page.tsx:
        // .sidebar-expanded + .main-content { margin-left: 260px; }
        // But I am NOT adding the 'sidebar-expanded' class to the Sidebar or a wrapper!
        // I am managing width via Framer Motion on the div itself.
        // So the margin on the main content is static 80px?
        // If Sidebar is expanded (260px) and margin is 80px, Sidebar COVERS 180px of content!
        // THAT IS THE BUG.

        className="fixed left-0 top-0 h-full bg-card border-r border-border z-50 flex flex-col"
      >
        <div className="p-4 flex items-center justify-between border-b border-border">
          {!isCollapsed && (
            <span className="font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Atonin AI
            </span>
          )}
          <button onClick={toggleSidebar} className="p-1 hover:bg-muted rounded-md text-muted-foreground">
            {isMobile ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
           <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewChat}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          >
            <Plus size={20} />
            {!isCollapsed && <span className="font-medium text-sm">New Chat</span>}
          </motion.button>

          <div className="my-4 border-t border-border" />

          <SidebarItem icon={MessageSquare} label="Chats" href="/" isCollapsed={isCollapsed} />
          <SidebarItem icon={Hammer} label="Crafts" href="/crafts" isCollapsed={isCollapsed} />

          <div className="my-4 border-t border-border" />

          {!isCollapsed && <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase">Recent</div>}

          <div className="space-y-1">
            {chatHistory.slice(0, 5).map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground truncate transition-colors ${isCollapsed ? 'hidden' : 'block'}`}
              >
                {chat.title}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          >
             <Settings size={20} />
             {!isCollapsed && <span className="text-sm">Theme: {theme}</span>}
          </button>
        </div>
      </motion.div>
    </>
  );
}
