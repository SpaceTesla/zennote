'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ComponentPropsWithoutRef } from 'react';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

interface CodeProps extends ComponentPropsWithoutRef<'code'> {
  inline?: boolean;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  return (
    <ScrollArea className={className}>
      <div className="prose prose-sm dark:prose-invert max-w-none p-6">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            code: ({ className, children, inline, ...props }: CodeProps) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <pre className={className} {...props}>
                  <code className={className}>{children}</code>
                </pre>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content || '*Start typing to see preview...*'}
        </ReactMarkdown>
      </div>
    </ScrollArea>
  );
}

