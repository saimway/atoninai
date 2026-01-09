"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Atonin V1' },
  { id: 'openai/gpt-oss-120b', name: 'Atonin (Thinking)' },
  { id: 'groq/compound', name: 'Atonin (HIGH)' },
];

interface ModelSelectorProps {
  currentModelId: string;
  onSelectModel: (id: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ currentModelId, onSelectModel, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedModel = MODELS.find(m => m.id === currentModelId) || MODELS[0];

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-colors"
      >
        <span>{selectedModel.name}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-48 py-1 rounded-lg border border-border bg-card shadow-lg z-50"
            >
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors
                    ${model.id === currentModelId ? 'text-primary font-medium' : 'text-muted-foreground'}
                  `}
                >
                  {model.name}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
