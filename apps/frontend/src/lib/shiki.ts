import type { BundledLanguage, Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

// Only bootstrap themes + plain text. Languages load on demand as separate
// chunks when a code block needs them — keeps the initial bundle small on CF Pages.
const BOOTSTRAP_LANGS = ['text'] as const;

const THEMES = ['github-dark-default', 'github-light-default'] as const;

export type ShikiTheme = (typeof THEMES)[number];

const LANGUAGE_ALIASES: Record<string, string> = {
  yml: 'yaml',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  cs: 'csharp',
  'c#': 'csharp',
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function getShikiTheme(resolvedTheme?: string): ShikiTheme {
  return resolvedTheme === 'dark'
    ? 'github-dark-default'
    : 'github-light-default';
}

export async function ensureLanguage(
  highlighter: Highlighter,
  language: string
): Promise<string> {
  const normalized = LANGUAGE_ALIASES[language] ?? language;

  if (highlighter.getLoadedLanguages().includes(normalized)) {
    return normalized;
  }

  const { bundledLanguages } = await import('shiki');

  if (!(normalized in bundledLanguages)) {
    return 'text';
  }

  try {
    await highlighter.loadLanguage(normalized as BundledLanguage);
    return normalized;
  } catch (error) {
    console.warn(`Failed to load Shiki language "${normalized}"`, error);
    return 'text';
  }
}

export async function safeCodeToHtml(
  highlighter: Highlighter,
  code: string,
  language: string,
  theme: ShikiTheme
): Promise<string> {
  const lang = await ensureLanguage(highlighter, language);

  try {
    return highlighter.codeToHtml(code, { lang, theme });
  } catch (error) {
    console.warn(
      `Shiki failed to highlight "${language}", falling back to plain text`,
      error
    );

    try {
      return highlighter.codeToHtml(code, { lang: 'text', theme });
    } catch {
      return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
    }
  }
}

export function loadHighlighter(): Promise<Highlighter> {
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = (async () => {
    const { getHighlighter } = await import('shiki');

    return getHighlighter({
      themes: [...THEMES],
      langs: [...BOOTSTRAP_LANGS],
    });
  })();

  return highlighterPromise;
}
