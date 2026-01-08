import type { Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

// Fine-grained imports - only load what we need
// This dramatically reduces bundle size from ~9MB to ~500KB
async function loadLanguages() {
  const langs = await Promise.all([
    import('shiki/langs/javascript'),
    import('shiki/langs/typescript'),
    import('shiki/langs/tsx'),
    import('shiki/langs/json'),
    import('shiki/langs/html'),
    import('shiki/langs/css'),
    import('shiki/langs/python'),
    import('shiki/langs/bash'),
    import('shiki/langs/sql'),
    import('shiki/langs/markdown'),
  ]);

  return langs.map((mod) => mod.default);
}

async function loadThemes() {
  const themes = await Promise.all([
    import('shiki/themes/github-dark-default'),
    import('shiki/themes/github-light-default'),
  ]);

  return themes.map((mod) => mod.default);
}

export function loadHighlighter() {
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = (async () => {
    // Use fine-grained core instead of full shiki bundle
    const { createHighlighterCore } = await import('shiki/core');
    const { createJavaScriptRegexEngine } = await import('shiki/engine/javascript');

    const langs = await loadLanguages();
    const themes = await loadThemes();

    // Use JavaScript regex engine instead of WASM (smaller, faster for web)
    return createHighlighterCore({
      langs,
      themes,
      // JavaScript engine is smaller and faster than WASM for web
      engine: createJavaScriptRegexEngine(),
    });
  })();

  return highlighterPromise;
}
