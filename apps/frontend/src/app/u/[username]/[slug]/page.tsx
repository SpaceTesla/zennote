export const runtime = 'edge';

import type { Metadata } from 'next';
import { PublicNoteClient } from '@/components/notes/public-note-client';
import {
  generateNoteMetadataForSlugRoute,
  getPublicNoteMetadataSafeBySlug,
} from '@/lib/metadata/note-metadata';
import { generateArticleStructuredData } from '@/lib/metadata/structured-data';

type PublicNotePageProps = {
  params: Promise<{ username: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: PublicNotePageProps): Promise<Metadata> {
  const { username, slug } = await params;
  return generateNoteMetadataForSlugRoute(username, slug);
}

export default async function PublicNotePage({ params }: PublicNotePageProps) {
  const { username, slug } = await params;
  const meta = await getPublicNoteMetadataSafeBySlug(username, slug);

  const structuredData = meta
    ? generateArticleStructuredData({
        id: meta.id,
        title: meta.title,
        contentExcerpt: meta.contentExcerpt,
        author: meta.owner_username,
        created_at: meta.created_at,
        updated_at: meta.updated_at,
        canonicalPath: `/u/${username}/${slug}`,
      })
    : null;

  return (
    <>
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      ) : null}
      <PublicNoteClient username={username} slug={slug} />
    </>
  );
}
