'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bold,
  Italic,
  Code,
  Link,
  Heading1,
  Heading2,
  List,
  Quote,
  Image,
} from '@/components/ui/hugeicons';

interface MarkdownToolbarProps {
  onInsert: (text: string, cursorOffset?: number) => void;
  disabled?: boolean;
}

export function MarkdownToolbar({ onInsert, disabled }: MarkdownToolbarProps) {
  const insertText = (before: string, after = '', cursorOffset = 0) => {
    onInsert(before + after, cursorOffset);
  };

  const buttons = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => insertText('**', '**', 2),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => insertText('*', '*', 1),
    },
    {
      icon: Code,
      label: 'Code',
      action: () => insertText('`', '`', 1),
    },
    {
      icon: Link,
      label: 'Link',
      action: () => insertText('[', '](url)', 1),
    },
    {
      icon: Heading1,
      label: 'Heading 1',
      action: () => insertText('# ', '', 2),
    },
    {
      icon: Heading2,
      label: 'Heading 2',
      action: () => insertText('## ', '', 3),
    },
    {
      icon: List,
      label: 'List',
      action: () => insertText('- ', '', 2),
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => insertText('> ', '', 2),
    },
    {
      icon: Image,
      label: 'Image',
      action: () => insertText('![alt](', ')', 1),
    },
  ];

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {buttons.map(({ icon: Icon, label, action }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={action}
                disabled={disabled}
                className="h-8 w-8 p-0"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
                <span className="sr-only">{label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

