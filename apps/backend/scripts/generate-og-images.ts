import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createCanvas, type SKRSContext2D } from '@napi-rs/canvas';

type PublicNoteMetadata = {
  id: string;
  title: string;
  contentExcerpt: string;
  updated_at?: string;
  created_at?: string;
};

const API_BASE_URL =
  process.env.API_BASE_URL || 'https://zennote-worker.shivansh-karan.workers.dev';
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'zennote-bucket';

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error(
    '[og-generator] Missing R2 credentials. Ensure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY are set.'
  );
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const WIDTH = 1200;
const HEIGHT = 630;
const PADDING = 80;

function truncate(text: string, maxLength: number) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(' ');
  const safe = lastSpace > 50 ? slice.slice(0, lastSpace) : slice;
  return `${safe.trim()}…`;
}

async function fetchNoteMetadata(noteId: string): Promise<PublicNoteMetadata | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/public/notes/${noteId}/metadata`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch (error) {
    console.error(`[og-generator] Failed to fetch metadata for note ${noteId}`, error);
    return null;
  }
}

async function fetchAllPublicNoteIds(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/public/notes/list`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) {
      console.error('[og-generator] Failed to fetch public notes list');
      return [];
    }
    const json = await res.json();
    const notes: { id: string }[] = json?.data?.notes ?? [];
    return notes.map((n) => n.id);
  } catch (error) {
    console.error('[og-generator] Failed to fetch public notes list', error);
    return [];
  }
}

function drawOgImage(meta: PublicNoteMetadata) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = '#f5f5f5';
  ctx.font = '700 48px "Inter", "Segoe UI", sans-serif';
  ctx.textBaseline = 'top';

  const title = truncate(meta.title || 'Untitled Note', 90);
  const description = truncate(
    meta.contentExcerpt || 'A note shared on Zennote – calm, focused note-taking.',
    180
  );

  wrapText(ctx, title, PADDING, PADDING, WIDTH - PADDING * 2, 56, 2);

  ctx.fillStyle = '#d1d5db';
  ctx.font = '400 24px "Inter", "Segoe UI", sans-serif';
  wrapText(ctx, description, PADDING, PADDING + 170, WIDTH - PADDING * 2, 34, 4);

  // Footer
  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 22px "Inter", "Segoe UI", sans-serif';
  ctx.fillText('Zennote', PADDING, HEIGHT - PADDING + 8);

  ctx.beginPath();
  ctx.arc(PADDING - 18, HEIGHT - PADDING + 14, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#6366f1';
  ctx.fill();

  return canvas.toBuffer('image/png');
}

function wrapText(
  ctx: SKRSContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(' ');
  let line = '';
  let lines = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trimEnd(), x, y);
      line = words[n] + ' ';
      y += lineHeight;
      lines += 1;
      if (lines >= maxLines - 1) break;
    } else {
      line = testLine;
    }
  }
  if (lines < maxLines) {
    ctx.fillText(line.trimEnd(), x, y);
  }
}

async function uploadToR2(noteId: string, buffer: Buffer) {
  const key = `og/notes/${noteId}.png`;
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );
  return key;
}

async function processNote(noteId: string) {
  const meta = await fetchNoteMetadata(noteId);
  if (!meta) {
    console.warn(`[og-generator] Skipping note ${noteId}: metadata not found`);
    return;
  }

  const buffer = drawOgImage(meta);
  const key = await uploadToR2(meta.id, buffer);
  console.log(`[og-generator] Uploaded ${key}`);
}

async function main() {
  const args = process.argv.slice(2);
  const noteIdArg = args.find((a) => a.startsWith('--noteId='));
  const all = args.includes('--all');

  if (!noteIdArg && !all) {
    console.error('Usage: npm run og:generate -- --noteId=<id> | --all');
    process.exit(1);
  }

  const ids: string[] = [];
  if (noteIdArg) {
    ids.push(noteIdArg.replace('--noteId=', '').trim());
  }
  if (all) {
    const allIds = await fetchAllPublicNoteIds();
    ids.push(...allIds);
  }

  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  for (const id of uniqueIds) {
    try {
      await processNote(id);
    } catch (error) {
      console.error(`[og-generator] Failed for note ${id}`, error);
    }
  }
}

main().catch((error) => {
  console.error('[og-generator] Unhandled error', error);
  process.exit(1);
});
