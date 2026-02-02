"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SettingsContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  customInstructions: string;
  setCustomInstructions: (instructions: string) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  topP: number;
  setTopP: (val: number) => void;
  maxTokens: number;
  setMaxTokens: (val: number) => void;
  isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState('');
  const [customInstructions, setCustomInstructionsState] = useState('');

  // Model Parameters Defaults
  const [temperature, setTemperatureState] = useState(0.7);
  const [topP, setTopPState] = useState(1.0);
  const [maxTokens, setMaxTokensState] = useState(4096);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('atonin_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.apiKey !== undefined) setApiKeyState(parsed.apiKey);
        if (parsed.customInstructions !== undefined) setCustomInstructionsState(parsed.customInstructions);
        if (parsed.temperature !== undefined) setTemperatureState(Number(parsed.temperature));
        if (parsed.topP !== undefined) setTopPState(Number(parsed.topP));
        if (parsed.maxTokens !== undefined) setMaxTokensState(Number(parsed.maxTokens));
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveSettings = (newSettings: Partial<SettingsContextType>) => {
    const currentSettings = {
      apiKey,
      customInstructions,
      temperature,
      topP,
      maxTokens,
      ...newSettings
    };

    // Filter out functions and non-serializable data just in case, though here we control the object
    const toSave = {
        apiKey: currentSettings.apiKey,
        customInstructions: currentSettings.customInstructions,
        temperature: currentSettings.temperature,
        topP: currentSettings.topP,
        maxTokens: currentSettings.maxTokens
    };

    localStorage.setItem('atonin_settings', JSON.stringify(toSave));
  };

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    saveSettings({ apiKey: key });
  };

  const setCustomInstructions = (instructions: string) => {
    setCustomInstructionsState(instructions);
    saveSettings({ customInstructions: instructions });
  };

  const setTemperature = (temp: number) => {
    setTemperatureState(temp);
    saveSettings({ temperature: temp });
  };

  const setTopP = (val: number) => {
    setTopPState(val);
    saveSettings({ topP: val });
  };

  const setMaxTokens = (val: number) => {
    setMaxTokensState(val);
    saveSettings({ maxTokens: val });
  };

  return (
    <SettingsContext.Provider value={{
        apiKey, setApiKey,
        customInstructions, setCustomInstructions,
        temperature, setTemperature,
        topP, setTopP,
        maxTokens, setMaxTokens,
        isLoaded
    }}>
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
