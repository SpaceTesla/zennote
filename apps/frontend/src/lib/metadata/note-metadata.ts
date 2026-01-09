import type { Metadata } from 'next';
import { BASE_URL, config } from '@/config';
import { PublicNoteMetadata } from '@/types/note';

const FALLBACK_TITLE = 'Untitled Note';
const FALLBACK_DESCRIPTION =
  'A note shared on Zennote – calm, focused note-taking.';
const OG_IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_OG_CDN_BASE_URL ||
  'https://pub-50ad70a7eabe4f36b7f1d6e21a269101.r2.dev';
const DEFAULT_OG_IMAGE = `${OG_IMAGE_BASE_URL}/og/default.png`;

// Use native fetch for SSR compatibility on Cloudflare edge
async function fetchMetadataFromApi<T>(endpoint: string): Promise<T | null> {
  try {
    const url = `${config.api.baseUrl}${endpoint}`;
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch (error) {
    console.error('[metadata] Fetch failed:', endpoint, error);
    return null;
  }
}

type CanonicalContext =
  | { route: 'id'; noteId: string }
  | { route: 'slug'; username: string; slug: string };

function buildOgImageUrl(noteId?: string | null) {
  const trimmed = noteId?.trim();
  if (!trimmed) return DEFAULT_OG_IMAGE;
  return `${OG_IMAGE_BASE_URL}/og/notes/${trimmed}.png`;
}

function buildMetadata(
  meta: PublicNoteMetadata | null,
  canonicalPath: string,
  options?: { noindex?: boolean }
): Metadata {
  const title = meta?.title?.trim() || FALLBACK_TITLE;
  const description = meta?.contentExcerpt?.trim() || FALLBACK_DESCRIPTION;
  const ogImageUrl = buildOgImageUrl(meta?.id);
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
  return fetchMetadataFromApi<PublicNoteMetadata>(
    config.api.endpoints.publicNotes.metadata(noteId)
  );
}

export async function getPublicNoteMetadataSafeBySlug(
  username: string,
  slug: string
): Promise<PublicNoteMetadata | null> {
  return fetchMetadataFromApi<PublicNoteMetadata>(
    config.api.endpoints.publicNotes.metadataBySlug(username, slug)
  );
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
