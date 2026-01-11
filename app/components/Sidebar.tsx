"use client";

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
  // Lifted props
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

export default function Sidebar({
  chatHistory,
  onSelectChat,
  onNewChat,
  isMobile,
  isOpen,
  setIsOpen,
  isCollapsed,
  setIsCollapsed
}: SidebarProps) {
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
        className="fixed left-0 top-0 h-full bg-card border-r border-border z-50 flex flex-col"
      >
        <div className="p-4 flex items-center justify-between border-b border-border">
          {(!isCollapsed || isMobile) && (
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
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
          >
            <Plus size={20} />
            {(!isCollapsed || isMobile) && <span className="font-medium text-sm">New Chat</span>}
          </motion.button>

          <div className="my-4 border-t border-border" />

          <SidebarItem icon={MessageSquare} label="Chats" href="/" isCollapsed={isCollapsed && !isMobile} />
          <SidebarItem icon={Hammer} label="Crafts" href="/crafts" isCollapsed={isCollapsed && !isMobile} />

          <div className="my-4 border-t border-border" />

          {(!isCollapsed || isMobile) && <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase">Recent</div>}

          <div className="space-y-1">
            {chatHistory.slice(0, 5).map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground truncate transition-colors ${isCollapsed && !isMobile ? 'hidden' : 'block'}`}
              >
                {chat.title}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
          >
             <Settings size={20} />
             {(!isCollapsed || isMobile) && <span className="text-sm">Theme: {theme}</span>}
          </button>
        </div>
      </motion.div>
    </>
  );
}
