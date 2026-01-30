"use client";

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Eye, Code, PanelRightOpen } from 'lucide-react';
import { useArtifact } from '@/app/contexts/ArtifactContext';
import { ChartRenderer } from '@/app/components/ChartRenderer';
import { MermaidRenderer } from '@/app/components/MermaidRenderer';

interface CodeBlockProps {
  language: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [view, setView] = useState<'code' | 'preview'>('code');
  const { openArtifact } = useArtifact();

  const isPreviewable = ['html', 'svg', 'chart', 'json-chart', 'mermaid'].includes(language?.toLowerCase());

  const copyToClipboard = async () => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleOpenArtifact = () => {
    openArtifact({
        id: crypto.randomUUID(),
        title: (language || 'Code').toUpperCase() + ' Snippet',
        content: value,
        language: language || 'text'
    });
  };

  return (
    <div className="rounded-lg overflow-hidden my-4 border border-border bg-zinc-950">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-zinc-400 lowercase">{language || 'code'}</span>
          {isPreviewable && (
            <div className="flex items-center gap-1 bg-zinc-800 rounded p-0.5">
              <button
                type="button"
                onClick={() => setView('code')}
                className={`p-1 rounded ${view === 'code' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-300'}`}
                title="Code"
              >
                <Code size={14} />
              </button>
              <button
                type="button"
                onClick={() => setView('preview')}
                className={`p-1 rounded ${view === 'preview' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-300'}`}
                title="Preview"
              >
                <Eye size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={handleOpenArtifact}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                title="Open in Side Panel"
            >
                <PanelRightOpen size={14} />
                <span className="hidden sm:inline">Open</span>
            </button>
            <div className="w-px h-4 bg-zinc-800" />
            <button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              {isCopied ? (
                <>
                  <Check size={14} className="text-green-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
        </div>
      </div>

      {view === 'preview' && isPreviewable ? (
        <div className={`p-4 overflow-auto min-h-[100px] flex items-center justify-center ${['html', 'svg'].includes(language.toLowerCase()) ? 'bg-white checkered-bg' : ''}`}>
           {language.toLowerCase() === 'html' && (
             <iframe
                srcDoc={value}
                className="w-full border-none h-[300px]"
                title="Preview"
                sandbox="allow-scripts"
             />
           )}
           {language.toLowerCase() === 'svg' && (
             <div
               dangerouslySetInnerHTML={{ __html: value }}
               className="flex items-center justify-center w-full"
             />
           )}
           {(language.toLowerCase() === 'chart' || language.toLowerCase() === 'json-chart') && (
             <ChartRenderer code={value} />
           )}
           {language.toLowerCase() === 'mermaid' && (
             <MermaidRenderer code={value} />
           )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'transparent',
              fontSize: '0.875rem',
            }}
            wrapLongLines={true}
          >
            {value}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
