import { memo, useState, useMemo, ComponentPropsWithoutRef } from 'react';
import { motion } from 'framer-motion';
import { ChatMessage } from '@/app/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import { Bot, User, Copy, Check, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

interface MessageBubbleProps {
  message: ChatMessage;
  onRegenerate?: () => void;
}

export const MessageBubble = memo(function MessageBubble({ message, onRegenerate }: MessageBubbleProps) {
  const [isCopied, setIsCopied] = useState(false);
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const markdownComponents = useMemo(() => ({
    table({ children }: ComponentPropsWithoutRef<'table'>) {
        return <div className="overflow-x-auto my-4"><table className="min-w-full border-collapse border border-border text-sm">{children}</table></div>
    },
    thead({ children }: ComponentPropsWithoutRef<'thead'>) {
        return <thead className="bg-muted/50">{children}</thead>
    },
    th({ children }: ComponentPropsWithoutRef<'th'>) {
        return <th className="border border-border px-4 py-2 text-left font-medium">{children}</th>
    },
    td({ children }: ComponentPropsWithoutRef<'td'>) {
        return <td className="border border-border px-4 py-2">{children}</td>
    },
    a({ href, children }: ComponentPropsWithoutRef<'a'>) {
        return <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">{children}</a>
    },
    ul({ children }: ComponentPropsWithoutRef<'ul'>) {
        return <ul className="list-disc pl-4 my-2 space-y-1">{children}</ul>
    },
    ol({ children }: ComponentPropsWithoutRef<'ol'>) {
        return <ol className="list-decimal pl-4 my-2 space-y-1">{children}</ol>
    },
    code({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match && !String(children).includes('\n');

      if (!isInline) {
        return (
          <CodeBlock
            language={match ? match[1] : ''}
            value={String(children).replace(/\n$/, '')}
          />
        );
      }

      return (
        <code className={cn("bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 font-mono text-xs", className)} {...props}>
          {children}
        </code>
      );
    }
  }), []);

  if (isSystem) return null; // Generally hide system messages in chat view

  const handleCopy = async () => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-4 w-full max-w-3xl mx-auto p-4 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser ? "bg-primary text-primary-foreground" : "bg-purple-600 text-white"
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className={cn(
        "flex flex-col gap-1 min-w-0 max-w-full",
        isUser ? "items-end" : "items-start"
      )}>
        <div className="font-semibold text-sm text-muted-foreground">
          {isUser ? 'You' : 'Atonin'}
        </div>
        <div className={cn(
          "rounded-2xl px-4 py-2 text-sm leading-relaxed break-words max-w-full overflow-hidden",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm w-full"
        )}>
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Actions Bar */}
        <div className={cn(
             "flex items-center gap-2 mt-1 transition-opacity",
             // Visible on hover on desktop, always visible on mobile (using a simple heuristic or just always visible for now)
             "opacity-70 group-hover:opacity-100",
             isUser ? "justify-end" : "justify-start"
        )}>
             <button onClick={handleCopy} className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors" title="Copy message">
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
             </button>
             {onRegenerate && (
                 <button onClick={onRegenerate} className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors" title="Regenerate response">
                      <RefreshCw size={14} />
                 </button>
             )}
        </div>

      </div>
    </motion.div>
  );
});
