"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: ['Ctrl', 'Enter'], label: 'Send Message' },
    { key: ['Shift', 'Enter'], label: 'New Line' },
    { key: ['Ctrl', 'K'], label: 'Search in Chat' },
    { key: ['Ctrl', '/'], label: 'Show Shortcuts' },
    { key: ['Ctrl', 'B'], label: 'Toggle Sidebar' },
    { key: ['Esc'], label: 'Close / Stop' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded-md text-muted-foreground">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm font-medium text-foreground">{shortcut.label}</span>
                <div className="flex items-center gap-1">
                  {shortcut.key.map((k, i) => (
                    <kbd
                      key={i}
                      className="px-2 py-1 bg-muted border border-border rounded-md text-xs font-mono text-muted-foreground min-w-[24px] text-center"
                    >
                      {k === 'Ctrl' ? <span className="text-xs">Ctrl</span> : k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>

           <div className="p-4 bg-muted/30 text-center">
                <p className="text-xs text-muted-foreground">
                    Use Ctrl on Windows/Linux, Cmd on Mac.
                </p>
            </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
