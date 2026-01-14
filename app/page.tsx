"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from '@/app/components/Sidebar';
import { MessageBubble } from '@/app/components/MessageBubble';
import { ModelSelector, MODELS } from '@/app/components/ModelSelector';
import { useLocalStorage, ChatMessage, ChatThread } from '@/app/hooks/useLocalStorage';
import { useMediaQuery } from '@/app/hooks/useMediaQuery';
import { Send, MoreVertical, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { chatHistory, setChatHistory } = useLocalStorage();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState(MODELS[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isMobile = useMediaQuery('(max-width: 768px)');

  const currentThread = useMemo(() =>
    chatHistory.find(c => c.id === currentChatId),
    [chatHistory, currentChatId]
  );

  const messages = useMemo(() =>
    currentThread ? currentThread.messages : [],
    [currentThread]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleNewChat = () => {
    setCurrentChatId(null);
    setInput('');
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    const thread = chatHistory.find(c => c.id === id);
    if (thread) {
      setCurrentModel(thread.modelId);
    }
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setInput('');
    setIsLoading(true);

    let threadId = currentChatId;
    let newHistory = [...chatHistory];
    let threadMessages = messages;

    // Create new thread if none exists
    if (!threadId) {
      threadId = uuidv4();
      const newThread: ChatThread = {
        id: threadId,
        title: userMessage.content.slice(0, 30) + (userMessage.content.length > 30 ? '...' : ''),
        messages: [userMessage],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        modelId: currentModel,
      };
      newHistory = [newThread, ...chatHistory];
      threadMessages = [userMessage];
      setCurrentChatId(threadId);
    } else {
      // Update existing thread
      const threadIndex = newHistory.findIndex(t => t.id === threadId);
      if (threadIndex > -1) {
        newHistory[threadIndex] = {
          ...newHistory[threadIndex],
          messages: [...newHistory[threadIndex].messages, userMessage],
          updatedAt: Date.now(),
        };
        threadMessages = newHistory[threadIndex].messages;
      }
    }
    setChatHistory(newHistory);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: threadMessages,
          modelId: currentModel,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        aiContent += text;

        // Update the thread in history with the partial message
        const threadIndex = newHistory.findIndex(t => t.id === threadId);
        const currentMessages = [...newHistory[threadIndex].messages];

        // If last message is AI, update it, else add it
        const lastMsg = currentMessages[currentMessages.length - 1];
        if (lastMsg.role === 'assistant') {
             currentMessages[currentMessages.length - 1] = { ...lastMsg, content: aiContent };
        } else {
             currentMessages.push({ role: 'assistant', content: aiContent });
        }

        newHistory[threadIndex] = {
            ...newHistory[threadIndex],
            messages: currentMessages,
        };
        setChatHistory([...newHistory]); // Trigger re-render
      }

    } catch (error) {
      console.error(error);
      // Add error message to chat
      const threadIndex = newHistory.findIndex(t => t.id === threadId);
      if (threadIndex > -1) {
          const msgs = [...newHistory[threadIndex].messages];
          msgs.push({ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' });
          newHistory[threadIndex].messages = msgs;
          setChatHistory(newHistory);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        chatHistory={chatHistory}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      {/*
          Issue Fix: Ensure main content margin accounts for Sidebar width.
          Sidebar is 260px when open (desktop default) and 80px when collapsed.
          Since Sidebar state is internal, we can't easily adjust margin purely via CSS unless we lift state
          or assume a default.
          The Sidebar component defaults to `isCollapsed = false`. So width is 260px.
          But the CSS below hardcodes `margin-left: 80px`?
          Wait, I wrote `.main-content { margin-left: 80px; }` in previous steps.
          If Sidebar is 260px, it overlaps 180px of content.
          I need to adjust the margin to 260px by default for desktop.
          Or better, lift the collapsed state to this parent to control margin dynamically.
          For now, I will set margin to 260px (expanded) as that's the default state in Sidebar.tsx.
          Wait, Sidebar.tsx has `const [isCollapsed, setIsCollapsed] = useState(false);`
          So it starts OPEN.
          So margin needs to be 260px.
      */}
      <div className="flex-1 flex flex-col h-full relative transition-all duration-300 md:ml-[260px] lg:ml-[260px] xl:ml-[260px] md:pl-0">

          {/* Mobile Header */}
          <div className="md:hidden flex items-center p-4 border-b border-border bg-card">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 hover:bg-muted rounded-md">
                  <MoreVertical size={20} />
              </button>
              <span className="ml-2 font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Atonin AI
              </span>
          </div>

          {/* Top Bar (Desktop) */}
          <div className="hidden md:flex items-center justify-between p-4 border-b border-border z-30 relative bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                 <ModelSelector currentModelId={currentModel} onSelectModel={setCurrentModel} disabled={isLoading || messages.length > 0} />
                 {messages.length > 0 && <span className="text-xs text-muted-foreground ml-2">(Model locked for thread)</span>}
              </div>
          </div>

           {/* Model Selector Mobile (floating or top) */}
           <div className="md:hidden p-2 flex justify-center border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
               <ModelSelector currentModelId={currentModel} onSelectModel={setCurrentModel} disabled={isLoading || messages.length > 0} />
           </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 flex items-center justify-center shadow-lg shadow-purple-500/20">
                          <span className="text-2xl text-white font-bold">A</span>
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Welcome to Atonin AI</h2>
                      <p className="text-muted-foreground max-w-md">
                          Start a conversation or create a Craft to get started.
                          I can help you with writing, coding, analysis and more.
                      </p>
                  </div>
              ) : (
                  <>
                      {messages.map((msg, idx) => (
                          <MessageBubble key={idx} message={msg} />
                      ))}
                      {isLoading && messages[messages.length - 1]?.role === 'user' && (
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
                  </>
              )}
              <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background border-t border-border">
              <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
                  <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Message Atonin..."
                      disabled={isLoading}
                      className="w-full bg-muted text-foreground placeholder-muted-foreground rounded-2xl py-3 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  />
                  <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                      <Send size={18} />
                  </button>
              </form>
              <div className="text-center mt-2 text-xs text-muted-foreground">
                  Atonin can make mistakes. Please verify important information.
              </div>
          </div>
      </div>
    </div>
  );
}

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
