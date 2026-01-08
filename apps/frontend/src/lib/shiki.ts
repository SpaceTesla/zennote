import type { BundledLanguage, BundledTheme, HighlighterGeneric } from 'shiki';

let highlighterPromise: Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> | null = null;

// Only include commonly used languages to reduce bundle size
const languages: BundledLanguage[] = [
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
];

export function loadHighlighter() {
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = import('shiki/bundle/web').then(async (shiki) => {
    return shiki.createHighlighter({
      themes: ['github-dark-default', 'github-light-default'],
      langs: languages,
    });
  });

  return highlighterPromise;
}
