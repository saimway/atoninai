"use client";

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface SlashCommandMenuProps {
  commands: SlashCommand[];
  selectedIndex: number;
  onSelect: (command: SlashCommand) => void;
}

export function SlashCommandMenu({ commands, selectedIndex, onSelect }: SlashCommandMenuProps) {
  if (commands.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-full left-0 mb-2 w-full max-w-sm bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
    >
      <div className="p-1 max-h-[300px] overflow-y-auto">
        {commands.map((command, index) => (
          <button
            key={command.id}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
              index === selectedIndex
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onClick={() => onSelect(command)}
          >
            <div className="p-1.5 bg-background rounded-md border border-border/50 shadow-sm">
                <command.icon size={16} />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium">{command.label}</span>
                <span className="text-xs text-muted-foreground truncate">{command.description}</span>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
