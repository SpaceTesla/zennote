import type { MetadataRoute } from 'next';
import { BASE_URL } from '@/config';
import { publicNotesApi } from '@/lib/api/public-notes';
import { PublicNoteListItem } from '@/types/note';

export const revalidate = 3600; // refresh sitemap hourly without blocking builds

function buildNoteUrl(note: PublicNoteListItem) {
  if (note.slug && note.slug_owner_id && note.owner_username) {
    return `${BASE_URL}/u/${note.owner_username}/${note.slug}`;
  }

  return `${BASE_URL}/s/${note.id}`;
}

async function safeListPublicNotes(): Promise<PublicNoteListItem[]> {
  try {
    return await publicNotesApi.listPublicNotes();
  } catch (error) {
    console.warn('[sitemap] Skipping note entries due to fetch error');
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const notes = await safeListPublicNotes();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  const noteEntries: MetadataRoute.Sitemap = notes.map((note) => ({
    url: buildNoteUrl(note),
    lastModified: new Date(note.updated_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticEntries, ...noteEntries];
}
