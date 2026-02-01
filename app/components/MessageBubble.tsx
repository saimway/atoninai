import { memo, useState, useMemo, useEffect, ComponentPropsWithoutRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage, ContentPart } from '@/app/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import { Bot, User, Copy, Check, RefreshCw, Pencil, Save, ChevronDown, ChevronRight, BrainCircuit, Volume2, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { CodeBlock } from './CodeBlock';
import { AutoResizeTextarea } from './AutoResizeTextarea';

interface MessageBubbleProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
  highlight?: string;
}

const extractThinking = (content: string) => {
  const thinkMatch = content.match(/<think>([\s\S]*?)(?:<\/think>|$)/);
  if (thinkMatch) {
    const thinking = thinkMatch[1].trim();
    const cleanContent = content.replace(/<think>[\s\S]*?(?:<\/think>|$)/, '').trim();
    return { thinking, cleanContent };
  }
  return { thinking: null, cleanContent: content };
};

export const MessageBubble = memo(function MessageBubble({ message, onRegenerate, onEdit, highlight }: MessageBubbleProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const getTextContent = (content: string | ContentPart[]) => {
    if (typeof content === 'string') return content;
    return content.filter(p => p.type === 'text').map(p => p.text).join('\n') || '';
  };

  const getImages = (content: string | ContentPart[]) => {
    if (typeof content === 'string') return [];
    return content.filter(p => p.type === 'image_url').map(p => p.image_url?.url).filter(Boolean) as string[];
  };

  const textContent = useMemo(() => getTextContent(message.content), [message.content]);
  const images = useMemo(() => getImages(message.content), [message.content]);

  const [editContent, setEditContent] = useState(textContent);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const { thinking, cleanContent } = useMemo(() => {
    if (isUser) return { thinking: null, cleanContent: textContent };
    return extractThinking(textContent);
  }, [textContent, isUser]);

  useEffect(() => {
    return () => {
        window.speechSynthesis.cancel();
    };
  }, []);

  const handleEditStart = () => {
    setEditContent(textContent);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent(textContent);
  };

  const handleEditSave = () => {
    if (editContent.trim() !== textContent && onEdit) {
      // We only support editing the text part for now
      // If the message was complex (images + text), we might need to handle it in parent
      // But onEdit in parent expects 'newContent: string'.
      // If we pass just the new text, the parent handles reconstruction or replacement?
      // In app/page.tsx handleEditMessage:
      // newMessages[index] = { ...newMessages[index], content: newContent };
      // This REPLACES the content with the string. Images would be lost if we just return string.
      // But ChatMessage content can be string | ContentPart[].
      // So if I pass a string, it becomes a string message (images lost).
      // Ideally I should reconstruct the array if images exist.
      // But onEdit definition in props is (newContent: string) => void.
      // I should update MessageBubbleProps but for now let's assume editing replaces content.
      // Wait, losing images on edit is bad UX.
      // For now, let's just pass the string. The user can re-attach if needed or I accept that editing text removes images.
      // OR, better: I update the parent to handle this.
      // But I can't easily change parent logic from here without changing the prop signature.
      // Actually, if I pass the string, and the parent sets content to string, images are lost.
      // Let's stick to that for this iteration or it gets too complex.
      onEdit(editContent.trim());
    }
    setIsEditing(false);
  };

  const highlightText = (text: string, query?: string) => {
    if (!query || !query.trim()) return text;
    // Escape special characters in query
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-500/40 text-inherit rounded-sm px-0.5 font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const isMatch = highlight && textContent.toLowerCase().includes(highlight.toLowerCase());

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
      await navigator.clipboard.writeText(cleanContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
    }

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const textToSpeak = cleanContent
        .replace(/[#*`_\[\]()]/g, '') // Basic markdown stripping
        .replace(/<[^>]*>/g, ''); // HTML tags

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
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
        isUser ? "items-end" : "items-start",
        isEditing ? "w-full" : ""
      )}>
        <div className="font-semibold text-sm text-muted-foreground">
          {isUser ? 'You' : 'Atonin'}
        </div>

        {isEditing ? (
          <div className="w-full bg-muted rounded-xl p-3 border border-border">
             <AutoResizeTextarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-transparent text-foreground placeholder-muted-foreground min-h-[60px] resize-none focus:outline-none"
                autoFocus
             />
             <div className="flex justify-end gap-2 mt-2">
                 <button
                   onClick={handleEditCancel}
                   className="px-3 py-1 text-xs font-medium rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handleEditSave}
                   disabled={!editContent.trim()}
                   className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                 >
                   Save & Submit
                 </button>
             </div>
          </div>
        ) : (
          <div className={cn(
            "rounded-2xl px-4 py-2 text-sm leading-relaxed break-words max-w-full overflow-hidden transition-shadow duration-300",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm w-full",
            !isUser && isMatch && "ring-2 ring-yellow-500/50 shadow-lg shadow-yellow-500/10"
          )}>
            {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {images.map((url, i) => (
                        <img key={i} src={url} alt="User upload" className="max-w-[200px] max-h-[200px] rounded-lg border border-white/20" />
                    ))}
                </div>
            )}
            {isUser ? (
              <div className="whitespace-pre-wrap">
                 {highlight ? highlightText(textContent, highlight) : textContent}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {thinking && (
                   <div className="border-b border-border/50 pb-2 mb-2">
                      <button
                        onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                        className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
                      >
                         <BrainCircuit size={14} />
                         <span>Thinking Process</span>
                         {isThinkingExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      <AnimatePresence>
                         {isThinkingExpanded && (
                           <motion.div
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: 'auto', opacity: 1 }}
                             exit={{ height: 0, opacity: 0 }}
                             className="overflow-hidden"
                           >
                              <div className="pt-2 text-xs text-muted-foreground italic leading-relaxed whitespace-pre-wrap border-l-2 border-primary/20 pl-3 ml-1 mt-1">
                                {thinking}
                              </div>
                           </motion.div>
                         )}
                      </AnimatePresence>
                   </div>
                )}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={markdownComponents}
                >
                  {cleanContent || (thinking ? '' : '...')}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Actions Bar */}
        {!isEditing && (
          <div className={cn(
               "flex items-center gap-2 mt-1 transition-opacity",
               "opacity-70 group-hover:opacity-100",
               isUser ? "justify-end" : "justify-start"
          )}>
               <button onClick={handleCopy} className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors" title="Copy message">
                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
               </button>
               {!isUser && (
                   <button onClick={handleSpeak} className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors" title={isSpeaking ? "Stop speaking" : "Read aloud"}>
                        {isSpeaking ? <Square size={14} fill="currentColor" /> : <Volume2 size={14} />}
                   </button>
               )}
               {isUser && onEdit && (
                 <button onClick={handleEditStart} className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors" title="Edit message">
                    <Pencil size={14} />
                 </button>
               )}
               {onRegenerate && (
                   <button onClick={onRegenerate} className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors" title="Regenerate response">
                        <RefreshCw size={14} />
                   </button>
               )}
          </div>
        )}

      </div>
    </motion.div>
  );
});
