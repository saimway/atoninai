"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Upload, Moon, Sun, Monitor, AlertTriangle, Check } from 'lucide-react';
import { ChatThread, Craft } from '@/app/hooks/useLocalStorage';
import { useTheme } from '@/app/contexts/ThemeContext';

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
  const [activeTab, setActiveTab] = useState<'general' | 'data'>('general');
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const handleExport = () => {
    const data = {
      version: 1,
      timestamp: Date.now(),
      chatHistory,
      crafts
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atonin_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        // Basic validation
        if (!data.chatHistory || !Array.isArray(data.chatHistory) || !data.crafts || !Array.isArray(data.crafts)) {
          throw new Error('Invalid file format');
        }

        // Ask for confirmation if needed, for now we just merge/replace
        // For simplicity, let's replace for now or merge distinct IDs.
        // Let's go with "Update" strategy: add missing, update existing?
        // Safer strategy: Add imported items that don't exist by ID.
        // Even safer for user: "Replace" or "Merge" options.
        // Let's do a simple Merge (add if ID unique).

        const existingChatIds = new Set(chatHistory.map(c => c.id));
        const newChats = data.chatHistory.filter((c: ChatThread) => !existingChatIds.has(c.id));

        const existingCraftIds = new Set(crafts.map(c => c.id));
        const newCrafts = data.crafts.filter((c: Craft) => !existingCraftIds.has(c.id));

        if (newChats.length === 0 && newCrafts.length === 0) {
             setImportStatus('success');
             setImportMessage('No new data found to import (all IDs exist).');
             return;
        }

        setChatHistory([...chatHistory, ...newChats]);
        setCrafts([...crafts, ...newCrafts]);

        setImportStatus('success');
        setImportMessage(`Successfully imported ${newChats.length} chats and ${newCrafts.length} crafts.`);

      } catch (err) {
        console.error(err);
        setImportStatus('error');
        setImportMessage('Failed to parse file. Please ensure it is a valid Atonin backup.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold">Settings</h2>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'data' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Data Management
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Appearance</h3>
                    <p className="text-sm text-muted-foreground mb-4">Customize how Atonin looks on your device.</p>

                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <Sun size={24} className="mb-2" />
                        <span className="text-sm font-medium">Light</span>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <Moon size={24} className="mb-2" />
                        <span className="text-sm font-medium">Dark</span>
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <Monitor size={24} className="mb-2" />
                        <span className="text-sm font-medium">System</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Export Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download a copy of your chat history and crafts. Keep this file safe!
                    </p>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <Download size={18} />
                      Download Backup
                    </button>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold mb-2">Import Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Restore your data from a backup file. This will merge new chats/crafts into your current library.
                    </p>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".json"
                      className="hidden"
                    />

                    <button
                      onClick={handleImportClick}
                      className="flex items-center gap-2 px-4 py-2 border border-border bg-card hover:bg-muted rounded-lg transition-colors"
                    >
                      <Upload size={18} />
                      Select Backup File
                    </button>

                    {importStatus === 'success' && (
                       <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3 text-green-600 dark:text-green-400">
                           <Check size={18} className="mt-0.5" />
                           <span className="text-sm">{importMessage}</span>
                       </div>
                    )}

                    {importStatus === 'error' && (
                       <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-600 dark:text-red-400">
                           <AlertTriangle size={18} className="mt-0.5" />
                           <span className="text-sm">{importMessage}</span>
                       </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-6">
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-1 flex items-center gap-2">
                              <AlertTriangle size={16} /> Note on Privacy
                          </h4>
                          <p className="text-sm text-muted-foreground">
                              All your data is stored locally in your browser. We do not store your chats on our servers.
                              When you export data, you are responsible for keeping the file secure.
                          </p>
                      </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
