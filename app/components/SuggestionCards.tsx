"use client";

import { FileText, Code, Cpu, Map } from 'lucide-react';

interface SuggestionCardsProps {
  onSelect: (text: string) => void;
}

export function SuggestionCards({ onSelect }: SuggestionCardsProps) {
  const suggestions = [
    {
      icon: FileText,
      title: "Summarize text",
      prompt: "Please summarize the following text into a concise paragraph: "
    },
    {
      icon: Code,
      title: "Write code",
      prompt: "Write a Python script to "
    },
    {
      icon: Cpu,
      title: "Explain concept",
      prompt: "Explain the concept of quantum computing in simple terms."
    },
    {
      icon: Map,
      title: "Plan a trip",
      prompt: "Create a 3-day travel itinerary for "
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full mt-8 px-4">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s.prompt)}
          className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/80 transition-all text-left group cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <s.icon size={20} />
          </div>
          <div>
            <h3 className="font-medium text-sm text-foreground">{s.title}</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{s.prompt}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
