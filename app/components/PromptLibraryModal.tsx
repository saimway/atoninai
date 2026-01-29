"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Trash2, Pencil, Book } from 'lucide-react';
import { useLocalStorage, SavedPrompt } from '@/app/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (content: string) => void;
}

export function PromptLibraryModal({ isOpen, onClose, onSelectPrompt }: PromptLibraryModalProps) {
  const { prompts, setPrompts } = useLocalStorage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const filteredPrompts = prompts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setTitle('');
    setContent('');
    setIsCreating(false);
    setEditingPromptId(null);
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    if (editingPromptId) {
      setPrompts(prompts.map(p =>
        p.id === editingPromptId
          ? { ...p, title, content }
          : p
      ));
    } else {
      const newPrompt: SavedPrompt = {
        id: uuidv4(),
        title,
        content,
        createdAt: Date.now(),
      };
      setPrompts([...prompts, newPrompt]);
    }
    resetForm();
  };

  const handleEdit = (prompt: SavedPrompt) => {
    setTitle(prompt.title);
    setContent(prompt.content);
    setEditingPromptId(prompt.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this prompt?')) {
      setPrompts(prompts.filter(p => p.id !== id));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Book className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Prompt Library</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {isCreating ? (
                /* Create/Edit Form */
                <div className="p-6 flex-1 overflow-y-auto">
                   <h3 className="text-lg font-medium mb-4">{editingPromptId ? 'Edit Prompt' : 'New Prompt'}</h3>
                   <div className="space-y-4">
                     <div>
                       <label className="text-sm font-medium text-muted-foreground mb-1 block">Title</label>
                       <input
                         value={title}
                         onChange={e => setTitle(e.target.value)}
                         placeholder="e.g. Code Review"
                         className="w-full bg-muted rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                       />
                     </div>
                     <div>
                       <label className="text-sm font-medium text-muted-foreground mb-1 block">Content</label>
                       <textarea
                         value={content}
                         onChange={e => setContent(e.target.value)}
                         placeholder="The prompt text..."
                         rows={8}
                         className="w-full bg-muted rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                       />
                     </div>
                   </div>
                   <div className="flex justify-end gap-3 mt-6">
                     <button
                       onClick={resetForm}
                       className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                     >
                       Cancel
                     </button>
                     <button
                       onClick={handleSave}
                       disabled={!title.trim() || !content.trim()}
                       className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                     >
                       Save Prompt
                     </button>
                   </div>
                </div>
              ) : (
                /* List View */
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-border flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search prompts..."
                        className="w-full bg-muted rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <button
                      onClick={() => setIsCreating(true)}
                      className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <Plus size={16} />
                      <span className="hidden sm:inline">New</span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredPrompts.length === 0 ? (
                      <div className="text-center text-muted-foreground py-10">
                        {searchQuery ? 'No matching prompts found.' : 'No saved prompts yet. Create one!'}
                      </div>
                    ) : (
                      filteredPrompts.map(prompt => (
                        <div
                          key={prompt.id}
                          className="bg-muted/30 border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-foreground">{prompt.title}</h3>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(prompt)}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-background rounded-md"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(prompt.id)}
                                className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-background rounded-md"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {prompt.content}
                          </p>
                          <button
                            onClick={() => {
                              onSelectPrompt(prompt.content);
                              onClose();
                            }}
                            className="w-full py-2 bg-background border border-border rounded-lg text-sm font-medium hover:border-primary/50 hover:text-primary transition-colors"
                          >
                            Use Prompt
                          </button>
                        </div>
                      ))
                    )}
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
