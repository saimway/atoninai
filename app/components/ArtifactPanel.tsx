"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, Eye, Copy, Check } from 'lucide-react';
import { useArtifact } from '@/app/contexts/ArtifactContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function ArtifactPanel() {
  const { artifact, isOpen, closeArtifact } = useArtifact();
  const [view, setView] = useState<'code' | 'preview'>('preview');
  const [isCopied, setIsCopied] = useState(false);

  // Reset view when artifact changes
  useEffect(() => {
    if (artifact) {
      const isPreviewable = ['html', 'svg'].includes(artifact.language.toLowerCase());
      setView(isPreviewable ? 'preview' : 'code');
    }
  }, [artifact]);

  if (!isOpen || !artifact) return null;

  const isPreviewable = ['html', 'svg'].includes(artifact.language.toLowerCase());

  const copyToClipboard = async () => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(artifact.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-background border-l border-border shadow-2xl z-40 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2 overflow-hidden">
             <span className="font-semibold truncate">{artifact.title || 'Artifact'}</span>
             <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                 {artifact.language}
             </span>
        </div>
        <div className="flex items-center gap-2">
             <button
                onClick={closeArtifact}
                className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                title="Close"
             >
                 <X size={20} />
             </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-1 bg-muted rounded p-0.5">
              {isPreviewable && (
                  <>
                    <button
                        onClick={() => setView('code')}
                        className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded transition-colors ${
                            view === 'code' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Code size={14} />
                        Code
                    </button>
                    <button
                        onClick={() => setView('preview')}
                        className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded transition-colors ${
                            view === 'preview' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Eye size={14} />
                        Preview
                    </button>
                  </>
              )}
               {!isPreviewable && (
                   <span className="text-xs text-muted-foreground px-2">Source Code</span>
               )}
          </div>
          <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
              {isCopied ? (
                <>
                  <Check size={14} className="text-green-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
          </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-zinc-950 relative">
          {view === 'preview' && isPreviewable ? (
             <div className="w-full h-full bg-white flex items-center justify-center checkered-bg min-h-full">
                {artifact.language.toLowerCase() === 'html' && (
                    <iframe
                        srcDoc={artifact.content}
                        className="w-full h-full border-none"
                        title="Preview"
                        sandbox="allow-scripts"
                    />
                )}
                {artifact.language.toLowerCase() === 'svg' && (
                    <div
                        dangerouslySetInnerHTML={{ __html: artifact.content }}
                        className="flex items-center justify-center w-full h-full p-8"
                    />
                )}
             </div>
          ) : (
             <SyntaxHighlighter
                language={artifact.language}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '1.5rem',
                  background: 'transparent',
                  fontSize: '0.875rem',
                  height: '100%',
                }}
                showLineNumbers={true}
                wrapLongLines={true}
             >
                {artifact.content}
             </SyntaxHighlighter>
          )}
      </div>
    </motion.div>
  );
}
