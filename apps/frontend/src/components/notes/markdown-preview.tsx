'use client';

import React, { ComponentPropsWithoutRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useTheme } from 'next-themes';
import type { Highlighter } from 'shiki';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { loadHighlighter } from '@/lib/shiki';
import { toast } from 'sonner';
import { Copy, CheckIcon } from '@/components/ui/hugeicons';

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

  const CodeBlockHeader = ({
    language,
    code,
  }: {
    language: string;
    code: string;
  }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success('Code copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error('Failed to copy code');
        console.error('Failed to copy code:', err);
      }
    };

    return (
      <div className="code-block-header">
        <span className="code-language">{language.toUpperCase()}</span>
        <button
          onClick={handleCopy}
          className="code-copy-button"
          aria-label="Copy code"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
    );
  };

  const renderCode = ({ inline, className, children, ...props }: CodeProps) => {
    // Handle inline code (single backticks)
    if (inline) {
      return (
        <code
          className={cn(
            'inline rounded-md px-1.5 py-0.5 text-sm font-mono text-foreground',
            className
          )}
          {...props}
        >
          {children}
        </code>
      );
    }

    // Handle code blocks (triple backticks)
    // For code blocks, we return just the code element
    // The pre wrapper will be handled by the pre component override
    const language = (className || '').replace('language-', '').trim();
    const code = String(children ?? '').replace(/\n$/, '');

    // Use Shiki for syntax highlighting if available
    if (highlighter && language) {
      const theme =
        resolvedTheme === 'dark'
          ? 'github-dark-default'
          : 'github-light-default';
      const html = highlighter.codeToHtml(code, {
        lang: language,
        theme,
      });

      return (
        <div className="code-block-wrapper not-prose">
          <CodeBlockHeader language={language} code={code} />
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      );
    }

    // Fallback: return code element that will be wrapped by pre component
    // Don't apply any inline code styles - the pre wrapper handles all styling
    return (
      <code className={className} {...props}>
        {code}
      </code>
    );
  };

  const renderPre = ({
    children,
    ...props
  }: ComponentPropsWithoutRef<'pre'>) => {
    // Check if children is a single React element that's a div (from Shiki)
    const child = React.isValidElement(children)
      ? children
      : Array.isArray(children) &&
        children.length === 1 &&
        React.isValidElement(children[0])
      ? children[0]
      : null;

    // If it's already a div (Shiki output), return it as-is without pre wrapper
    // This prevents <pre> inside <p> hydration errors
    if (child && child.type === 'div') {
      return <>{children}</>;
    }

    // Otherwise, wrap in pre element for regular code blocks
    return (
      <pre className="overflow-x-auto text-sm font-mono" {...props}>
        {children}
      </pre>
    );
  };

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="markdown-prose px-2 max-w-3xl mx-auto w-full">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code: renderCode,
            pre: renderPre,
          }}
        >
          {content || '*Start typing to see preview...*'}
        </ReactMarkdown>
      </div>
    </ScrollArea>
  );
}
