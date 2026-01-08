export const runtime = 'edge';

import type { Metadata } from 'next';
import { SharedNoteClient } from '@/components/notes/shared-note-client';
import {
  generateNoteMetadataForIdRoute,
  getPublicNoteMetadataSafeById,
} from '@/lib/metadata/note-metadata';
import { generateArticleStructuredData } from '@/lib/metadata/structured-data';

type SharedNotePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: SharedNotePageProps): Promise<Metadata> {
  const { id } = await params;
  return generateNoteMetadataForIdRoute(id);
}

export default async function SharedNotePage({ params }: SharedNotePageProps) {
  const { id } = await params;
  const meta = await getPublicNoteMetadataSafeById(id);

  const canonicalPath =
    meta?.slug && meta.owner_username
      ? `/u/${meta.owner_username}/${meta.slug}`
      : `/s/${id}`;

  const structuredData = meta
    ? generateArticleStructuredData({
        id: meta.id,
        title: meta.title,
        contentExcerpt: meta.contentExcerpt,
        author: meta.owner_username,
        created_at: meta.created_at,
        updated_at: meta.updated_at,
        canonicalPath,
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
      <SharedNoteClient noteId={id} />
    </>
  );
}
