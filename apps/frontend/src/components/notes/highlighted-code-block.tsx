'use client';

import { useEffect, useState } from 'react';
import {
  getShikiTheme,
  loadHighlighter,
  safeCodeToHtml,
  type ShikiTheme,
} from '@/lib/shiki';

interface HighlightedCodeBlockProps {
  code: string;
  language: string;
  theme?: string;
}

export function HighlightedCodeBlock({
  code,
  language,
  theme: resolvedTheme,
}: HighlightedCodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);
  const shikiTheme: ShikiTheme = getShikiTheme(resolvedTheme);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const highlighter = await loadHighlighter();
        const result = await safeCodeToHtml(
          highlighter,
          code,
          language,
          shikiTheme
        );
        if (active) setHtml(result);
      } catch (error) {
        console.error('Failed to highlight code block', error);
        if (active) setHtml(null);
      }
    })();

    return () => {
      active = false;
    };
  }, [code, language, shikiTheme]);

  if (html) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <pre className="overflow-x-auto text-sm font-mono">
      <code>{code}</code>
    </pre>
  );
}
