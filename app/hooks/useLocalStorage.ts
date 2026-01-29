import { useState, useEffect } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  modelId: string;
  isFavorite?: boolean;
}

export interface Craft {
  id: string;
  name: string;
  systemInstruction: string;
  createdAt: number;
}

export interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export function useLocalStorage() {
  const [chatHistory, setChatHistory] = useState<ChatThread[]>([]);
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Wrap in a function to ensure it's treated as an effect callback and not synchronous execution if that was the issue (unlikely for useEffect, but let's be safe)
    const loadData = () => {
        const savedHistory = localStorage.getItem('atonin_chat_history');
        if (savedHistory) {
          setChatHistory(JSON.parse(savedHistory));
        }

        const savedCrafts = localStorage.getItem('atonin_crafts');
        if (savedCrafts) {
          setCrafts(JSON.parse(savedCrafts));
        }

        const savedPrompts = localStorage.getItem('atonin_prompts');
        if (savedPrompts) {
          setPrompts(JSON.parse(savedPrompts));
        }

        setIsLoaded(true);
    };

    loadData();
  }, []);

  const saveChatHistory = (action: React.SetStateAction<ChatThread[]>) => {
    setChatHistory(prev => {
        const next = typeof action === 'function' ? (action as Function)(prev) : action;
        localStorage.setItem('atonin_chat_history', JSON.stringify(next));
        return next;
    });
  };

  const saveCrafts = (newCrafts: Craft[]) => {
    setCrafts(newCrafts);
    localStorage.setItem('atonin_crafts', JSON.stringify(newCrafts));
  };

  const savePrompts = (newPrompts: SavedPrompt[]) => {
    setPrompts(newPrompts);
    localStorage.setItem('atonin_prompts', JSON.stringify(newPrompts));
  };

  return {
    chatHistory,
    setChatHistory: saveChatHistory,
    crafts,
    setCrafts: saveCrafts,
    prompts,
    setPrompts: savePrompts,
    isLoaded,
  };
}
