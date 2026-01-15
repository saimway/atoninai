import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onEnter?: () => void;
  maxHeight?: number;
}

export function AutoResizeTextarea({
  className,
  value,
  onChange,
  onEnter,
  maxHeight = 200,
  ...props
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to correctly calculate scrollHeight
    textarea.style.height = 'auto';

    // Set new height based on scrollHeight, capped at maxHeight
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;

    // Show scrollbar if content exceeds max height
    if (textarea.scrollHeight > maxHeight) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
  }, [value, maxHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Prevent default behavior (newline)
      e.preventDefault();
      // Call onEnter handler if provided
      onEnter?.();
    }
    // Call original onKeyDown if provided
    props.onKeyDown?.(e);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      className={cn(
        "resize-none overflow-hidden block w-full outline-none bg-transparent",
        className
      )}
      rows={1}
      {...props}
    />
  );
}
