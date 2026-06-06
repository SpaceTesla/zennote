# R2 Setup for OG Images

OG images are pre-generated and stored in Cloudflare R2, then served via R2's public URL.

## Architecture

- **Storage**: Cloudflare R2 bucket `zennote-bucket`
- **Upload**: Scripts use AWS S3 SDK with R2 API credentials
- **Serving**: Public R2 URL (images are publicly accessible)
- **Worker Binding**: `OG_IMAGES` binding exists in `wrangler.toml` but is not currently used in Worker code

## Setup Steps

### 1. Create R2 Bucket

```bash
# Via Cloudflare Dashboard:
# R2 > Create bucket > Name: zennote-bucket
# Enable "Public Access" (Object Public Access)
```

### 2. Generate R2 API Credentials

1. Go to Cloudflare Dashboard > R2 > Manage R2 API Tokens
2. Create token with `Object Read/Write` permissions on `zennote-bucket`
3. Store credentials in `.env.local`:
   ```
   R2_ACCOUNT_ID=your-account-id
   R2_ACCESS_KEY_ID=your-access-key
   R2_SECRET_ACCESS_KEY=your-secret-key
   R2_BUCKET_NAME=zennote-bucket
   ```

### 3. Get Public R2 URL

1. In R2 bucket settings, find the "Public R2 URL" (format: `https://pub-XXXXX.r2.dev`)
2. Set in frontend `.env.local`:
   ```
   NEXT_PUBLIC_OG_CDN_BASE_URL=https://pub-XXXXX.r2.dev
   ```

### 4. Generate OG Images

```bash
# Generate default OG image
npm run og:default

# Generate OG image for specific note
npm run og:generate -- --noteId=<note-id>

# Generate OG images for all public notes
npm run og:generate -- --all
```

Images are uploaded to:
- `og/default.png` - Default fallback image
- `og/notes/{noteId}.png` - Per-note OG images

### 5. Verify

Check that images are accessible:
- Default: `{NEXT_PUBLIC_OG_CDN_BASE_URL}/og/default.png`
- Note: `{NEXT_PUBLIC_OG_CDN_BASE_URL}/og/notes/{noteId}.png`

Response headers should include `Cache-Control: public, max-age=31536000, immutable`.
