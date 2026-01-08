import { BASE_URL } from '@/config';

export interface ArticleData {
  id: string;
  title: string;
  contentExcerpt: string;
  author: string | null;
  created_at: string;
  updated_at: string;
  canonicalPath: string;
}

export function generateArticleStructuredData(data: ArticleData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.contentExcerpt,
    author: data.author
      ? {
          '@type': 'Person',
          name: data.author,
        }
      : undefined,
    datePublished: data.created_at,
    dateModified: data.updated_at,
    url: `${BASE_URL}${data.canonicalPath}`,
    publisher: {
      '@type': 'Organization',
      name: 'Zennote',
      url: BASE_URL,
    },
  };
}
