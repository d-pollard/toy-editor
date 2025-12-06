import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
  maxHeight?: number;
}

const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ className, minHeight = 80, maxHeight, onChange, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [isAtMaxHeight, setIsAtMaxHeight] = React.useState(false);

    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      const newHeight = Math.max(minHeight, textarea.scrollHeight);
      
      if (maxHeight && newHeight >= maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        setIsAtMaxHeight(true);
      } else {
        textarea.style.height = `${newHeight}px`;
        setIsAtMaxHeight(false);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      onChange?.(e);
    };

    useEffect(() => {
      adjustHeight();
    }, [minHeight, maxHeight]);

    return (
      <textarea
        ref={(element) => {
          // Handle both the forwarded ref and our local ref
          textareaRef.current = element;
          if (typeof ref === 'function') {
            ref(element);
          } else if (ref) {
            ref.current = element;
          }
        }}
        className={cn(
          "flex w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none prompt-scrollbar",
          isAtMaxHeight ? "overflow-auto" : "overflow-hidden",
          className
        )}
        onChange={handleChange}
        style={{ minHeight: `${minHeight}px`, maxHeight: maxHeight ? `${maxHeight}px` : undefined }}
        {...props}
      />
    );
  }
);

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export { AutoResizeTextarea };
