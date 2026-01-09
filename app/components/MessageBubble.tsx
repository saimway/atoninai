import { motion } from 'framer-motion';
import { ChatMessage } from '@/app/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

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
        "flex flex-col gap-1 min-w-0",
        isUser ? "items-end" : "items-start"
      )}>
        <div className="font-semibold text-sm text-muted-foreground">
          {isUser ? 'You' : 'Atonin'}
        </div>
        <div className={cn(
          "rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        )}>
          {message.content}
        </div>
      </div>
    </motion.div>
  );
}
