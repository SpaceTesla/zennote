import type { Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

// Fine-grained configuration - only load what we need
// This dramatically reduces bundle size from ~9MB to ~500KB
// Using explicit language/theme arrays instead of full bundle
const LANGUAGES = [
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

const THEMES = ['github-dark-default', 'github-light-default'] as const;

export function loadHighlighter(): Promise<Highlighter> {
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = (async () => {
    // Use getHighlighter with explicit languages/themes
    // This is more efficient than loading the full bundle
    const { getHighlighter } = await import('shiki');

    return getHighlighter({
      themes: [...THEMES],
      langs: [...LANGUAGES],
    });
  })();

  return highlighterPromise;
}
