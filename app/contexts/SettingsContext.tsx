"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SettingsContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  customInstructions: string;
  setCustomInstructions: (instructions: string) => void;
  isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState('');
  const [customInstructions, setCustomInstructionsState] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('atonin_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.apiKey) setApiKeyState(parsed.apiKey);
        if (parsed.customInstructions) setCustomInstructionsState(parsed.customInstructions);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveSettings = (newApiKey: string, newInstructions: string) => {
    const settings = { apiKey: newApiKey, customInstructions: newInstructions };
    localStorage.setItem('atonin_settings', JSON.stringify(settings));
  };

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    saveSettings(key, customInstructions);
  };

  const setCustomInstructions = (instructions: string) => {
    setCustomInstructionsState(instructions);
    saveSettings(apiKey, instructions);
  };

  return (
    <SettingsContext.Provider value={{ apiKey, setApiKey, customInstructions, setCustomInstructions, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
