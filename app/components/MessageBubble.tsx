import { motion } from 'framer-motion';
import { ChatMessage } from '@/app/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from './CodeBlock';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) return null; // Generally hide system messages in chat view

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-4 w-full max-w-3xl mx-auto p-4",
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
              components={{
                code({ className, children, ...props }) {
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
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </motion.div>
  );
}
