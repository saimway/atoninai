"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Artifact {
  id: string;
  title: string;
  content: string;
  language: string;
}

interface ArtifactContextType {
  artifact: Artifact | null;
  isOpen: boolean;
  openArtifact: (artifact: Artifact) => void;
  closeArtifact: () => void;
}

const ArtifactContext = createContext<ArtifactContextType | undefined>(undefined);

export function ArtifactProvider({ children }: { children: ReactNode }) {
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openArtifact = useCallback((newArtifact: Artifact) => {
    setArtifact(newArtifact);
    setIsOpen(true);
  }, []);

  const closeArtifact = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ArtifactContext.Provider value={{ artifact, isOpen, openArtifact, closeArtifact }}>
      {children}
    </ArtifactContext.Provider>
  );
}

export function useArtifact() {
  const context = useContext(ArtifactContext);
  if (context === undefined) {
    throw new Error('useArtifact must be used within an ArtifactProvider');
  }
  return context;
}
