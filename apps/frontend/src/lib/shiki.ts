import type { Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

// Only include commonly used languages to reduce bundle size
const languages = [
  'javascript',
  'typescript',
  'tsx',
  'json',
  'html',
  'css',
  'python',
  'bash',
  'sql',
  'markdown',
] as const;

export function loadHighlighter() {
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = import('shiki').then(async (shiki) => {
    return shiki.createHighlighter({
      themes: ['github-dark-default', 'github-light-default'],
      langs: [...languages],
    });
  });

  return highlighterPromise;
}
