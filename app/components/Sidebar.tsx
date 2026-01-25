"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SidebarItem } from './SidebarItem';
import { MessageSquare, Hammer, Settings, Menu, X, Plus, Search, Trash2, Star, Keyboard } from 'lucide-react';
import { useSidebar } from '@/app/contexts/SidebarContext';
import { ChatThread, Craft } from '@/app/hooks/useLocalStorage';
import { SettingsModal } from './SettingsModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { cn } from '@/lib/utils';

interface SidebarProps {
  chatHistory: ChatThread[];
  setChatHistory: (history: ChatThread[]) => void;
  crafts: Craft[];
  setCrafts: (crafts: Craft[]) => void;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentChatId?: string | null;
}

export default function Sidebar({
  chatHistory,
  setChatHistory,
  crafts,
  setCrafts,
  onSelectChat,
  onNewChat,
  isMobile,
  isOpen,
  setIsOpen,
  currentChatId
}: SidebarProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            setIsShortcutsOpen(prev => !prev);
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
            e.preventDefault();
            toggleSidebar();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const handleToggle = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      toggleSidebar();
    }
  };

  const handleDeleteChat = (e: React.MouseEvent | React.KeyboardEvent, chatId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
        const newHistory = chatHistory.filter(c => c.id !== chatId);
        setChatHistory(newHistory);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent | React.KeyboardEvent, chatId: string) => {
    e.stopPropagation();
    const newHistory = chatHistory.map(c => {
        if (c.id === chatId) {
            return { ...c, isFavorite: !c.isFavorite };
        }
        return c;
    });
    setChatHistory(newHistory);
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

  // Filter and Group Chats
  const groupedChats = useMemo(() => {
    const query = searchQuery.toLowerCase();

    // Filter and map to include snippets
    const filtered = chatHistory.map(chat => {
        const titleMatch = chat.title.toLowerCase().includes(query);
        let matchSnippet: string | undefined;

        if (!titleMatch && query) {
            const matchingMsg = chat.messages.find(msg => msg.content.toLowerCase().includes(query));
            if (matchingMsg) {
                const index = matchingMsg.content.toLowerCase().indexOf(query);
                const start = Math.max(0, index - 20);
                const end = Math.min(matchingMsg.content.length, index + query.length + 20);
                matchSnippet = (start > 0 ? '...' : '') + matchingMsg.content.slice(start, end) + (end < matchingMsg.content.length ? '...' : '');
            }
        }

        if (titleMatch || matchSnippet) {
            return { ...chat, matchSnippet };
        }
        return null;
    }).filter(Boolean) as (ChatThread & { matchSnippet?: string })[];

    const groups: { [key: string]: (ChatThread & { matchSnippet?: string })[] } = {
      'Favorites': [],
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Older': []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const lastWeek = today - 7 * 86400000;

    filtered.forEach(chat => {
      if (chat.isFavorite) {
        groups['Favorites'].push(chat);
        return;
      }

      const chatDate = new Date(chat.updatedAt || chat.createdAt).getTime();

      if (chatDate >= today) {
        groups['Today'].push(chat);
      } else if (chatDate >= yesterday) {
        groups['Yesterday'].push(chat);
      } else if (chatDate >= lastWeek) {
        groups['Previous 7 Days'].push(chat);
      } else {
        groups['Older'].push(chat);
      }
    });

    return groups;
  }, [chatHistory, searchQuery]);

  return (
    <>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        chatHistory={chatHistory}
        setChatHistory={setChatHistory}
        crafts={crafts}
        setCrafts={setCrafts}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

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
          {!isCollapsed && (
            <span className="font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Atonin AI
            </span>
          )}
          <button onClick={handleToggle} className="p-1 hover:bg-muted rounded-md text-muted-foreground">
            {isMobile ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-2">
           <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewChat}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          >
            <Plus size={20} />
            {!isCollapsed && <span className="font-medium text-sm">New Chat</span>}
          </motion.button>

          <div className="my-2 border-t border-border" />

          <SidebarItem icon={MessageSquare} label="Chats" href="/" isCollapsed={isCollapsed} />
          <SidebarItem icon={Hammer} label="Crafts" href="/crafts" isCollapsed={isCollapsed} />

          <div className="my-2 border-t border-border" />

          {/* Search Bar */}
          {!isCollapsed && (
             <div className="px-2 mb-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/50 border border-transparent focus:border-border rounded-md py-1.5 pl-8 pr-2 text-sm focus:outline-none transition-colors"
                />
             </div>
          )}

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto space-y-4 px-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {Object.entries(groupedChats).map(([group, chats]) => {
                if (chats.length === 0) return null;

                return (
                    <div key={group} className={isCollapsed ? 'hidden' : 'block'}>
                        <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase sticky top-0 bg-card z-10">{group}</div>
                        <div className="space-y-0.5">
                            {chats.map(chat => (
                                <button
                                    key={chat.id}
                                    onClick={() => onSelectChat(chat.id)}
                                    className={cn(
                                        "group flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                        currentChatId === chat.id
                                            ? "bg-muted text-foreground font-medium"
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    )}
                                >
                                    <div className="flex flex-col flex-1 min-w-0 mr-2">
                                        <span className="truncate">{chat.title || 'Untitled Chat'}</span>
                                        {chat.matchSnippet && (
                                            <span className="text-xs text-muted-foreground/70 truncate">
                                                {chat.matchSnippet}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                      <div
                                          role="button"
                                          tabIndex={0}
                                          onClick={(e) => handleToggleFavorite(e, chat.id)}
                                          onKeyDown={(e) => {
                                              if (e.key === 'Enter' || e.key === ' ') {
                                                  handleToggleFavorite(e, chat.id);
                                              }
                                          }}
                                          className={cn(
                                              "p-1 hover:bg-yellow-500/10 hover:text-yellow-500 rounded transition-all shrink-0",
                                              chat.isFavorite ? "text-yellow-500" : "text-muted-foreground/50 hover:text-yellow-500"
                                          )}
                                          title={chat.isFavorite ? "Unpin chat" : "Pin chat"}
                                          aria-label={chat.isFavorite ? "Unpin chat" : "Pin chat"}
                                      >
                                          <Star size={14} fill={chat.isFavorite ? "currentColor" : "none"} />
                                      </div>
                                      <div
                                          role="button"
                                          tabIndex={0}
                                          onClick={(e) => handleDeleteChat(e, chat.id)}
                                          onKeyDown={(e) => {
                                              if (e.key === 'Enter' || e.key === ' ') {
                                                  handleDeleteChat(e, chat.id);
                                              }
                                          }}
                                          className={cn(
                                              "p-1 hover:bg-red-500/10 hover:text-red-500 rounded transition-all shrink-0 text-muted-foreground/50 hover:text-red-500"
                                          )}
                                          title="Delete chat"
                                          aria-label="Delete chat"
                                      >
                                          <Trash2 size={14} />
                                      </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border mt-auto space-y-1">
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${isCollapsed ? 'justify-center' : ''}`}
            title="Keyboard Shortcuts"
          >
             <Keyboard size={20} />
             {!isCollapsed && <span className="text-sm">Shortcuts</span>}
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          >
             <Settings size={20} />
             {!isCollapsed && <span className="text-sm">Settings</span>}
          </button>
        </div>
      </motion.div>
    </>
  );
}
