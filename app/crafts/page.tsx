"use client";

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from '@/app/components/Sidebar';
import { useLocalStorage, Craft, ChatThread, ChatMessage } from '@/app/hooks/useLocalStorage';
import { Plus, Trash2, ArrowLeft, Bot, Send, Loader2, Menu, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from '@/app/components/MessageBubble';
import { useSidebar } from '@/app/contexts/SidebarContext';

function BotIcon() {
    return (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4 text-white"
      >
        <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
        <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
        <path d="M9 12h6" />
        <path d="M12 16v5" />
      </svg>
    )
}

export default function CraftsPage() {
  const { crafts, setCrafts, chatHistory, setChatHistory } = useLocalStorage();
  const [isCreating, setIsCreating] = useState(false);
  const [newCraftName, setNewCraftName] = useState('');
  const [newCraftInstruction, setNewCraftInstruction] = useState('');

  const [selectedCraftId, setSelectedCraftId] = useState<string | null>(null);
  const selectedCraft = crafts.find(c => c.id === selectedCraftId);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Use SidebarContext
  const { isCollapsed, isMobile, setMobileOpen } = useSidebar();

  const currentThread = chatHistory.find(t => t.title === `Craft: ${selectedCraft?.name}`);
  const messages = currentThread ? currentThread.messages : [];

  const handleCreateCraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCraftName || !newCraftInstruction) return;

    const newCraft: Craft = {
      id: uuidv4(),
      name: newCraftName,
      systemInstruction: newCraftInstruction,
      createdAt: Date.now(),
    };

    setCrafts([...crafts, newCraft]);
    setIsCreating(false);
    setNewCraftName('');
    setNewCraftInstruction('');
  };

  const handleDeleteCraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this Craft?')) {
      setCrafts(crafts.filter(c => c.id !== id));
      if (selectedCraftId === id) setSelectedCraftId(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedCraft) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setInput('');
    setIsLoading(true);

    let updatedHistory = [...chatHistory];
    let threadId = currentThread?.id;

    if (!threadId) {
        threadId = uuidv4();
        const newThread: ChatThread = {
            id: threadId,
            title: `Craft: ${selectedCraft.name}`,
            messages: [userMessage],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            modelId: 'llama-3.3-70b-versatile',
        };
        updatedHistory = [newThread, ...updatedHistory];
    } else {
        const threadIndex = updatedHistory.findIndex(t => t.id === threadId);
        if (threadIndex > -1) {
            updatedHistory[threadIndex].messages.push(userMessage);
            updatedHistory[threadIndex].updatedAt = Date.now();
        }
    }
    setChatHistory(updatedHistory);

    try {
        const messagesToSend = [
            { role: 'system', content: selectedCraft.systemInstruction },
            ...(currentThread ? currentThread.messages : []),
            userMessage
        ];

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: messagesToSend,
                modelId: 'llama-3.3-70b-versatile',
            }),
        });

        if (!response.ok) throw new Error('Failed');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let aiContent = '';

        while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            aiContent += decoder.decode(value, { stream: true });

             const threadIndex = updatedHistory.findIndex(t => t.id === threadId);
             const currentMessages = [...updatedHistory[threadIndex].messages];
             const lastMsg = currentMessages[currentMessages.length - 1];

             if (lastMsg.role === 'assistant') {
                 lastMsg.content = aiContent;
             } else {
                 currentMessages.push({ role: 'assistant', content: aiContent });
             }

             updatedHistory[threadIndex].messages = currentMessages;
             setChatHistory([...updatedHistory]);
        }

    } catch (err) {
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const mainContentStyle = {
    marginLeft: isMobile ? 0 : (isCollapsed ? '80px' : '260px'),
    transition: 'margin-left 0.3s ease-in-out'
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        chatHistory={chatHistory}
        onSelectChat={() => {}}
        onNewChat={() => setSelectedCraftId(null)}
      />

      <div
        className="flex-1 flex flex-col h-full relative"
        style={mainContentStyle}
      >
        {/* Mobile Header (Crafts) */}
         <div className="md:hidden flex items-center p-4 border-b border-border bg-card">
              <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 hover:bg-muted rounded-md">
                  <MoreVertical size={20} />
              </button>
              <span className="ml-2 font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  My Crafts
              </span>
          </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between p-4 border-b border-border">
             <div className="flex items-center gap-4">
                 <h1 className="text-xl font-bold">My Crafts</h1>
                 <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
                 >
                     <Plus size={16} /> New Craft
                 </button>
             </div>
        </div>

        {/* Mobile FAB for new craft if needed, or just keep it in grid */}

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
                {selectedCraftId ? (
                    // Craft Chat View
                    <motion.div
                        key="chat"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full flex flex-col"
                    >
                        <div className="flex items-center p-3 border-b border-border bg-muted/30">
                            <button onClick={() => setSelectedCraftId(null)} className="p-2 hover:bg-muted rounded-full mr-2">
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h3 className="font-bold">{selectedCraft?.name}</h3>
                                <p className="text-xs text-muted-foreground">Custom Assistant</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {messages.length === 0 && (
                                <div className="text-center text-muted-foreground mt-10">
                                    <Bot size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>Start chatting with {selectedCraft?.name}!</p>
                                </div>
                            )}
                            {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-4 w-full max-w-3xl mx-auto p-4"
                                >
                                     <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                                         <BotIcon />
                                     </div>
                                     <div className="flex items-center">
                                         <Loader2 className="animate-spin text-muted-foreground" size={18} />
                                         <span className="ml-2 text-sm text-muted-foreground">Atonin is thinking...</span>
                                     </div>
                                </motion.div>
                            )}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-background">
                            <div className="relative max-w-3xl mx-auto">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder={`Message ${selectedCraft?.name}...`}
                                    className="w-full bg-muted rounded-2xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-xl">
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    // Crafts Grid View
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="h-full overflow-y-auto p-6"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {crafts.map((craft) => (
                                <motion.div
                                    key={craft.id}
                                    whileHover={{ y: -5 }}
                                    onClick={() => setSelectedCraftId(craft.id)}
                                    className="bg-card border border-border rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all relative group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                            <Bot size={24} />
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteCraft(craft.id, e)}
                                            className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{craft.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {craft.systemInstruction}
                                    </p>
                                </motion.div>
                            ))}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setIsCreating(true)}
                                className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors min-h-[200px]"
                            >
                                <Plus size={32} className="mb-2" />
                                <span className="font-medium">Create New Craft</span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Create Modal */}
        <AnimatePresence>
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Create New Craft</h2>
                            <form onSubmit={handleCreateCraft}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Name</label>
                                        <input
                                            required
                                            value={newCraftName}
                                            onChange={e => setNewCraftName(e.target.value)}
                                            placeholder="e.g. Coding Assistant"
                                            className="w-full bg-muted rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Instructions</label>
                                        <textarea
                                            required
                                            value={newCraftInstruction}
                                            onChange={e => setNewCraftInstruction(e.target.value)}
                                            placeholder="How should this AI behave?"
                                            rows={4}
                                            className="w-full bg-muted rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        Create Craft
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}
