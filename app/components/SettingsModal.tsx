"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Trash2, Download, Upload, AlertTriangle, Key, MessageSquareText, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useSettings } from '@/app/contexts/SettingsContext';
import { ChatThread, Craft } from '@/app/hooks/useLocalStorage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: ChatThread[];
  setChatHistory: (history: ChatThread[]) => void;
  crafts: Craft[];
  setCrafts: (crafts: Craft[]) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  chatHistory,
  setChatHistory,
  crafts,
  setCrafts
}: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const { apiKey, setApiKey, customInstructions, setCustomInstructions } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Local state for inputs to avoid excessive context updates/localStorage writes
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localInstructions, setLocalInstructions] = useState(customInstructions);

  useEffect(() => {
    setLocalApiKey(apiKey);
    setLocalInstructions(customInstructions);
  }, [apiKey, customInstructions]);

  const handleSaveSettings = () => {
    if (localApiKey !== apiKey) setApiKey(localApiKey);
    if (localInstructions !== customInstructions) setCustomInstructions(localInstructions);
  };

  const handleExport = () => {
    const data = {
      chatHistory,
      crafts,
      version: 1,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atonin-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.chatHistory && Array.isArray(data.chatHistory)) {
          setChatHistory(data.chatHistory);
        }
        if (data.crafts && Array.isArray(data.crafts)) {
          setCrafts(data.crafts);
        }
        alert('Data imported successfully!');
        onClose();
      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import data. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    setChatHistory([]);
    setConfirmClear(false);
    // Maybe keep crafts? Or clear everything?
    // Let's clear history only as the button says "Clear Chat History"
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={() => { handleSaveSettings(); onClose(); }} className="p-1 hover:bg-muted rounded-md text-muted-foreground">
              <X size={20} />
            </button>
          </div>

        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {/* General Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">General</h3>

            {/* Custom Instructions */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <MessageSquareText size={16} />
                    <span>Custom Instructions (System Prompt)</span>
                </div>
                <textarea
                    value={localInstructions}
                    onChange={(e) => setLocalInstructions(e.target.value)}
                    onBlur={handleSaveSettings}
                    placeholder="e.g. You are a helpful coding assistant. Always answer in Markdown."
                    className="w-full bg-muted/50 border border-transparent focus:border-primary rounded-lg p-3 text-sm min-h-[100px] resize-none focus:outline-none transition-colors"
                />
                <p className="text-xs text-muted-foreground">
                    These instructions will be added to all your chats.
                </p>
            </div>

            {/* API Key */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Key size={16} />
                    <span>Groq API Key (Optional)</span>
                </div>
                <div className="relative">
                    <input
                        type={showApiKey ? "text" : "password"}
                        value={localApiKey}
                        onChange={(e) => setLocalApiKey(e.target.value)}
                        onBlur={handleSaveSettings}
                        placeholder="gsk_..."
                        className="w-full bg-muted/50 border border-transparent focus:border-primary rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none transition-colors"
                    />
                    <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Leave blank to use the default key. Your key is stored locally.
                </p>
            </div>
          </div>

            {/* Appearance */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Appearance</h3>
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                  <span>Theme Mode</span>
                </div>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="px-3 py-1.5 bg-background border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </button>
              </div>
            </div>

            {/* Data Management */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Data Management</h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExport}
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
                >
                  <Download size={24} className="text-blue-500" />
                  <span className="text-sm font-medium">Export Data</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border relative"
                >
                  <Upload size={24} className="text-green-500" />
                  <span className="text-sm font-medium">Import Data</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                </button>
              </div>

              {/* Clear Data */}
              <div className="pt-2">
                {!confirmClear ? (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="w-full flex items-center justify-center gap-2 p-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
                  >
                    <Trash2 size={18} />
                    <span className="font-medium">Clear Chat History</span>
                  </button>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-red-500 shrink-0" size={20} />
                      <p className="text-sm text-red-500/90">
                        Are you sure? This action cannot be undone and will delete all your conversation history.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleClearAll}
                        className="flex-1 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        Yes, Clear All
                      </button>
                      <button
                        onClick={() => setConfirmClear(false)}
                        className="flex-1 py-2 bg-background border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                    Atonin AI v1.1.0
                </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
