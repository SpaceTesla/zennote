import { ImageResponse } from 'next/og';
import { config, BASE_URL } from '@/config';

export const runtime = 'edge';
export const revalidate = 600;

type PublicNoteMeta = {
  id: string;
  title: string;
  contentExcerpt: string;
  slug: string | null;
  slug_owner_id: string | null;
  owner_username: string | null;
  updated_at: string;
  created_at: string;
};

const FALLBACK_TITLE = 'Untitled Note';
const FALLBACK_DESCRIPTION = 'A note shared on Zennote – calm, focused note-taking.';

async function fetchNoteMetadata(noteId: string): Promise<PublicNoteMeta | null> {
  try {
    const res = await fetch(
      `${config.api.baseUrl}${config.api.endpoints.publicNotes.metadata(noteId)}`,
      {
        next: { revalidate: 600 },
        headers: {
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=1800',
        },
      }
    );

    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch (error) {
    console.error('[og] Failed to fetch public note metadata', error);
    return null;
  }
}

function truncate(text: string, maxLength: number) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(' ');
  const safe = lastSpace > 50 ? slice.slice(0, lastSpace) : slice;
  return `${safe.trim()}…`;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = await fetchNoteMetadata(id);

  const title = truncate(meta?.title || FALLBACK_TITLE, 90);
  const description = truncate(meta?.contentExcerpt || FALLBACK_DESCRIPTION, 180);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0a0a0a',
          color: '#f5f5f5',
          padding: '80px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              maxWidth: '940px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 400,
              color: '#d1d5db',
              lineHeight: 1.4,
              maxWidth: '940px',
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#9ca3af',
            fontSize: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '999px',
                background: '#6366f1',
              }}
            />
            <span>Zennote</span>
          </div>
          <span>{BASE_URL.replace(/^https?:\/\//, '')}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=1800',
      },
    }
  );
}
