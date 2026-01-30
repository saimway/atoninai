"use client";

import mermaid from 'mermaid';
import { useEffect, useRef, useState } from 'react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
});

interface MermaidRendererProps {
  code: string;
}

export function MermaidRenderer({ code }: MermaidRendererProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const render = async () => {
        if (ref.current) {
            try {
                setStatus('Rendering...');
                // Reset content for mermaid run
                ref.current.removeAttribute('data-processed');
                ref.current.innerHTML = code;

                await mermaid.run({
                    nodes: [ref.current],
                });
                setStatus('Rendered');
            } catch (error: any) {
                console.error('Mermaid render error:', error);
                setStatus(`Error: ${error.message}`);
                if (ref.current) {
                    ref.current.innerHTML = `<div class="text-red-500 text-sm p-2">Failed to render diagram: ${error.message}</div>`;
                }
            }
        }
    };

    // Small delay to ensure DOM is fully ready and ref is attached
    const t = setTimeout(render, 100);
    return () => clearTimeout(t);
  }, [code]);

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 bg-zinc-950 rounded-lg overflow-x-auto border border-zinc-800">
        {status !== 'Rendered' && <div className="text-xs text-zinc-500 mb-2">{status}</div>}
        <div ref={ref} className="mermaid text-zinc-200">
            {code}
        </div>
    </div>
  );
}
