"use client";

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from '@/app/components/Sidebar';
import { useLocalStorage, Craft, ChatThread, ChatMessage } from '@/app/hooks/useLocalStorage';
import { useSettings } from '@/app/contexts/SettingsContext';
import { Plus, Trash2, ArrowLeft, Bot, Send, Loader2, MoreVertical, Pencil, Copy, Eraser, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from '@/app/components/MessageBubble';
import { useMediaQuery } from '@/app/hooks/useMediaQuery';
import { useRouter } from 'next/navigation';

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

const CRAFT_TEMPLATES = [
  {
    name: "Code Expert",
    instruction: "You are an expert software engineer specialized in writing clean, efficient, and modern code. Always explain your reasoning, handle edge cases, and follow best practices. When providing code, include comments and type definitions."
  },
  {
    name: "Creative Writer",
    instruction: "You are a creative writer with a flair for vivid imagery and engaging storytelling. Adapt your tone to the genre requested (e.g., sci-fi, fantasy, mystery). Focus on showing rather than telling."
  },
  {
    name: "Summarizer",
    instruction: "You are an expert summarizer. Your goal is to extract the most important information from the text provided and present it continuously and concisely. Use bullet points for key takeaways."
  },
  {
    name: "Math Tutor",
    instruction: "You are a patient and knowledgeable math tutor. Explain complex concepts step-by-step using simple language. Encourage the user to solve parts of the problem themselves."
  },
  {
    name: "Debate Coach",
    instruction: "You are a debate coach. Analyze arguments for logical fallacies, suggest counter-arguments, and help the user strengthen their position. Remain neutral and objective."
  },
  {
    name: "Translator",
    instruction: "You are a professional translator. Translate the text accurately while preserving the original tone, nuance, and cultural context. If there are ambiguities, explain them."
  }
];

export default function CraftsPage() {
  const { crafts, setCrafts, chatHistory, setChatHistory } = useLocalStorage();
  const { apiKey, customInstructions } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCraftId, setEditingCraftId] = useState<string | null>(null);
  const [newCraftName, setNewCraftName] = useState('');
  const [newCraftInstruction, setNewCraftInstruction] = useState('');

  const [selectedCraftId, setSelectedCraftId] = useState<string | null>(null);
  const selectedCraft = crafts.find(c => c.id === selectedCraftId);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const router = useRouter();

  const currentThread = chatHistory.find(t => t.title === `Craft: ${selectedCraft?.name}`);
  const messages = currentThread ? currentThread.messages : [];

  const handleClearChat = () => {
      if (!selectedCraft || !currentThread) return;
      if (confirm('Are you sure you want to clear this chat history?')) {
          const updatedHistory = chatHistory.filter(t => t.id !== currentThread.id);
          setChatHistory(updatedHistory);
      }
  };

  const handleSaveCraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCraftName || !newCraftInstruction) return;

    if (editingCraftId) {
        const oldCraft = crafts.find(c => c.id === editingCraftId);
        if (oldCraft) {
            const updatedCrafts = crafts.map(c =>
                c.id === editingCraftId
                ? { ...c, name: newCraftName, systemInstruction: newCraftInstruction }
                : c
            );
            setCrafts(updatedCrafts);

            // Update chat thread title if exists
            const oldTitle = `Craft: ${oldCraft.name}`;
            const newTitle = `Craft: ${newCraftName}`;

            const updatedHistory = chatHistory.map(t =>
                t.title === oldTitle ? { ...t, title: newTitle } : t
            );
            setChatHistory(updatedHistory);
        }
    } else {
        const newCraft: Craft = {
          id: uuidv4(),
          name: newCraftName,
          systemInstruction: newCraftInstruction,
          createdAt: Date.now(),
        };
        setCrafts([...crafts, newCraft]);
    }

    setIsModalOpen(false);
    setNewCraftName('');
    setNewCraftInstruction('');
    setEditingCraftId(null);
  };

  const handleDuplicateCraft = (craft: Craft, e: React.MouseEvent) => {
      e.stopPropagation();
      const newCraft: Craft = {
          id: uuidv4(),
          name: `${craft.name} (Copy)`,
          systemInstruction: craft.systemInstruction,
          createdAt: Date.now(),
      };
      setCrafts([...crafts, newCraft]);
  };

  const openCreateModal = () => {
      setNewCraftName('');
      setNewCraftInstruction('');
      setEditingCraftId(null);
      setIsModalOpen(true);
  };

  const fillTemplate = (template: { name: string, instruction: string }) => {
      setNewCraftName(template.name);
      setNewCraftInstruction(template.instruction);
  };

  const openEditModal = (craft: Craft, e: React.MouseEvent) => {
      e.stopPropagation();
      setNewCraftName(craft.name);
      setNewCraftInstruction(craft.systemInstruction);
      setEditingCraftId(craft.id);
      setIsModalOpen(true);
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
        const fullSystemInstruction = customInstructions
            ? `${customInstructions}\n\n${selectedCraft.systemInstruction}`
            : selectedCraft.systemInstruction;

        const messagesToSend = [
            { role: 'system', content: fullSystemInstruction },
            ...(currentThread ? currentThread.messages : []),
            userMessage
        ];

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: messagesToSend,
                modelId: 'llama-3.3-70b-versatile',
                apiKey,
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

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        chatHistory={chatHistory}
        setChatHistory={setChatHistory}
        crafts={crafts}
        setCrafts={setCrafts}
        onSelectChat={(chatId) => {
          router.push(`/?chatId=${chatId}`);
        }}
        onNewChat={() => setSelectedCraftId(null)}
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentChatId={null}
      />

      <div className="flex-1 flex flex-col h-full relative transition-all duration-300 md:ml-[260px] lg:ml-[260px] xl:ml-[260px] md:pl-0">
         <style jsx global>{`
            @media (min-width: 768px) {
              .main-content { margin-left: 80px; }
              .sidebar-expanded + .main-content { margin-left: 260px; }
            }
          `}</style>

        {/* Mobile Header (Crafts) */}
         <div className="md:hidden flex items-center p-4 border-b border-border bg-card">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 hover:bg-muted rounded-md">
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
                    onClick={openCreateModal}
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
                        <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
                            <div className="flex items-center">
                                <button onClick={() => setSelectedCraftId(null)} className="p-2 hover:bg-muted rounded-full mr-2">
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h3 className="font-bold">{selectedCraft?.name}</h3>
                                    <p className="text-xs text-muted-foreground">Custom Assistant</p>
                                </div>
                            </div>
                            {messages.length > 0 && (
                                <button
                                    onClick={handleClearChat}
                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 text-sm"
                                    title="Clear Chat"
                                >
                                    <Eraser size={18} />
                                    <span className="hidden sm:inline">Clear Chat</span>
                                </button>
                            )}
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
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-lg p-1">
                                            <button
                                                onClick={(e) => handleDuplicateCraft(craft, e)}
                                                className="p-1.5 text-muted-foreground hover:text-blue-500 hover:bg-muted rounded-md"
                                                title="Duplicate"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => openEditModal(craft, e)}
                                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-md"
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteCraft(craft.id, e)}
                                                className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-muted rounded-md"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{craft.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {craft.systemInstruction}
                                    </p>
                                </motion.div>
                            ))}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={openCreateModal}
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

        {/* Create/Edit Modal */}
        <AnimatePresence>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">{editingCraftId ? 'Edit Craft' : 'Create New Craft'}</h2>

                            {!editingCraftId && (
                                <div className="mb-6">
                                    <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Start with a Template</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CRAFT_TEMPLATES.map((t) => (
                                            <button
                                                key={t.name}
                                                type="button"
                                                onClick={() => fillTemplate(t)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium"
                                            >
                                                <Sparkles size={12} />
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSaveCraft}>
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
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        {editingCraftId ? 'Save Changes' : 'Create Craft'}
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
