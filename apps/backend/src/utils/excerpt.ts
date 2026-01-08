const MARKDOWN_STRIP_REGEX =
  /(```[\s\S]*?```|`[^`]*`|\*\*|__|\*|_|~~|>|\[([^\]]+)\]\([^\)]+\)|!\[[^\]]*\]\([^\)]+\)|#{1,6}\s|[-*_]{3,}|<\/?[^>]+>)/g;

/**
 * Generate a clean excerpt from markdown content for SEO-safe usage.
 * Strips markdown, collapses whitespace, and trims to a sensible length.
 */
export function generateExcerpt(markdown: string, maxLength = 160): string {
  if (!markdown) return '';

  const stripped = markdown
    .replace(MARKDOWN_STRIP_REGEX, '$2')
    .replace(/\s+/g, ' ')
    .trim();

  if (!stripped) return '';

  if (stripped.length <= maxLength) return stripped;

  const truncated = stripped.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const safeCut = lastSpace > 50 ? truncated.slice(0, lastSpace) : truncated;
  return `${safeCut.trim()}...`;
}
