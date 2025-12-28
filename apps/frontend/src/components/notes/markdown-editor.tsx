'use client';

import { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownToolbar } from './markdown-toolbar';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing your markdown...',
  disabled,
  className,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsert = (text: string, cursorOffset: number = 0) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);

    const newValue = before + text + selectedText + after;
    onChange(newValue);

    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + text.length + cursorOffset;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <MarkdownToolbar onInsert={handleInsert} disabled={disabled} />
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 resize-none border-0 focus-visible:ring-0 font-mono text-sm rounded-none"
      />
    </div>
  );
}
