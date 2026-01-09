import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createCanvas, type SKRSContext2D } from '@napi-rs/canvas';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'zennote-bucket';

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error(
    '[og-default] Missing R2 credentials. Ensure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY are set.'
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

function drawDefaultImage() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Title
  ctx.fillStyle = '#f5f5f5';
  ctx.font = '700 56px "Inter", "Segoe UI", sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText('Zennote', PADDING, PADDING + 40);

  // Tagline
  ctx.fillStyle = '#d1d5db';
  ctx.font = '400 32px "Inter", "Segoe UI", sans-serif';
  wrapText(ctx, 'Calm, focused note-taking.', PADDING, PADDING + 140, WIDTH - PADDING * 2, 44, 2);

  // Accent dot
  ctx.beginPath();
  ctx.arc(PADDING, HEIGHT - PADDING + 8, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#6366f1';
  ctx.fill();

  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 22px "Inter", "Segoe UI", sans-serif';
  ctx.fillText('zennote', PADDING + 20, HEIGHT - PADDING);

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

async function uploadDefault(buffer: Buffer) {
  const key = 'og/default.png';
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );
  console.log(`[og-default] Uploaded ${key}`);
}

async function main() {
  const buffer = drawDefaultImage();
  await uploadDefault(buffer);
}

main().catch((error) => {
  console.error('[og-default] Unhandled error', error);
  process.exit(1);
});
