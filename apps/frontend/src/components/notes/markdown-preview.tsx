'use client';

import { ComponentPropsWithoutRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useTheme } from 'next-themes';
import type { Highlighter } from 'shiki';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { loadHighlighter } from '@/lib/shiki';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

interface CodeProps extends ComponentPropsWithoutRef<'code'> {
  inline?: boolean;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const { resolvedTheme } = useTheme();
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

  useEffect(() => {
    let active = true;

    loadHighlighter()
      .then((instance) => {
        if (active) setHighlighter(instance);
      })
      .catch((error) => {
        console.error('Failed to load syntax highlighter', error);
      });

    return () => {
      active = false;
    };
  }, []);

  const renderCode = ({ inline, className, children, ...props }: CodeProps) => {
    const language = (className || '').replace('language-', '').trim();
    const code = String(children ?? '').replace(/\n$/, '');

    if (!inline && highlighter && language) {
      const theme = resolvedTheme === 'dark' ? 'github-dark-default' : 'github-light-default';
      const html = highlighter.codeToHtml(code, {
        lang: language,
        theme,
      });

      return <div className="not-prose" dangerouslySetInnerHTML={{ __html: html }} />;
    }

    if (!inline) {
      return (
        <pre className="not-prose overflow-x-auto rounded-xl border bg-muted/70 px-4 py-3 text-sm font-mono">
          <code className={className} {...props}>
            {code}
          </code>
        </pre>
      );
    }

    return (
      <code
        className={cn(
          'rounded-md bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground',
          className,
        )}
        {...props}
      >
        {children}
      </code>
    );
  };

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="markdown-prose px-6 py-6">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code: renderCode,
          }}
        >
          {content || '*Start typing to see preview...*'}
        </ReactMarkdown>
      </div>
    </ScrollArea>
  );
}

