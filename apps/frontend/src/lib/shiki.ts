import type { Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

const languages: string[] = [
  'bash',
  'c',
  'cpp',
  'css',
  'diff',
  'docker',
  'go',
  'graphql',
  'html',
  'java',
  'javascript',
  'json',
  'kotlin',
  'markdown',
  'php',
  'python',
  'ruby',
  'rust',
  'scala',
  'shell',
  'sql',
  'swift',
  'toml',
  'tsx',
  'typescript',
  'yaml',
];

export function loadHighlighter() {
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = import('shiki').then(async (shiki) => {
    return shiki.getHighlighter({
      themes: [
        'github-light-default',
        'github-dark-default',
        'rose-pine-dawn',
        'rose-pine',
      ],
      langs: languages,
    });
  });

  return highlighterPromise;
}
