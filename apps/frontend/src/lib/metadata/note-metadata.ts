import type { Metadata } from 'next';
import { BASE_URL } from '@/config';
import { publicNotesApi } from '@/lib/api/public-notes';
import { PublicNoteMetadata } from '@/types/note';

const FALLBACK_TITLE = 'Untitled Note';
const FALLBACK_DESCRIPTION =
  'A note shared on Zennote – calm, focused note-taking.';

type CanonicalContext =
  | { route: 'id'; noteId: string }
  | { route: 'slug'; username: string; slug: string };

function buildMetadata(
  meta: PublicNoteMetadata | null,
  canonicalPath: string,
  options?: { noindex?: boolean }
): Metadata {
  const title = meta?.title?.trim() || FALLBACK_TITLE;
  const description = meta?.contentExcerpt?.trim() || FALLBACK_DESCRIPTION;
  const ogImageUrl = `${BASE_URL}/og/note/${meta?.id ?? 'note'}`;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;

  return {
    title: `${title} | Zennote`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: options?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
      publishedTime: meta?.created_at,
      modifiedTime: meta?.updated_at,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export async function getPublicNoteMetadataSafeById(
  noteId: string
): Promise<PublicNoteMetadata | null> {
  try {
    return await publicNotesApi.getMetadataById(noteId);
  } catch (error) {
    console.error('[metadata] Failed to fetch public note metadata by id', error);
    return null;
  }
}

export async function getPublicNoteMetadataSafeBySlug(
  username: string,
  slug: string
): Promise<PublicNoteMetadata | null> {
  try {
    return await publicNotesApi.getMetadataBySlug(username, slug);
  } catch (error) {
    console.error('[metadata] Failed to fetch public note metadata by slug', error);
    return null;
  }
}

export async function generateNoteMetadataForIdRoute(
  noteId: string
): Promise<Metadata> {
  const meta = await getPublicNoteMetadataSafeById(noteId);

  if (!meta) {
    return buildMetadata(null, `/s/${noteId}`, { noindex: true });
  }

  // Prefer slug-based canonical when available
  if (meta.slug && meta.owner_username) {
    const canonicalPath = `/u/${meta.owner_username}/${meta.slug}`;
    return buildMetadata(meta, canonicalPath, { noindex: true });
  }

  const canonicalPath = `/s/${noteId}`;
  return buildMetadata(meta, canonicalPath);
}

export async function generateNoteMetadataForSlugRoute(
  username: string,
  slug: string
): Promise<Metadata> {
  const meta = await getPublicNoteMetadataSafeBySlug(username, slug);
  const canonicalPath = `/u/${username}/${slug}`;

  // On failure, return safe fallback that does not index
  if (!meta) {
    return buildMetadata(null, canonicalPath, { noindex: true });
  }

  return buildMetadata(meta, canonicalPath);
}

export function resolveCanonicalPath(meta: PublicNoteMetadata | null): CanonicalContext {
  if (meta?.slug && meta.owner_username) {
    return { route: 'slug', username: meta.owner_username, slug: meta.slug };
  }

  return { route: 'id', noteId: meta?.id ?? '' };
}
