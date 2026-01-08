import type { MetadataRoute } from 'next';
import { BASE_URL } from '@/config';
import { publicNotesApi } from '@/lib/api/public-notes';
import { PublicNoteListItem } from '@/types/note';

function buildNoteUrl(note: PublicNoteListItem) {
  if (note.slug && note.slug_owner_id && note.owner_username) {
    return `${BASE_URL}/u/${note.owner_username}/${note.slug}`;
  }

  return `${BASE_URL}/s/${note.id}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let notes: PublicNoteListItem[] = [];

  try {
    notes = await publicNotesApi.listPublicNotes();
  } catch (error) {
    console.error('[sitemap] Failed to fetch public notes', error);
  }

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: new Date(),
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
