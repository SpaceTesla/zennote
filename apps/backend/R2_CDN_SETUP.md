# R2 CDN Setup for OG Images

Follow these steps to serve pre-generated OG images via a CDN-backed R2 bucket.

1. Create or confirm the R2 bucket

   - Name: `zennote-bucket`
   - Public access: enabled (Object Public Access on)

2. Generate R2 API credentials

   - Create an R2 API token with `Object Read/Write` on `zennote-bucket`
   - Store values in environment variables:
     - `R2_ACCOUNT_ID`
     - `R2_ACCESS_KEY_ID`
     - `R2_SECRET_ACCESS_KEY`
     - `R2_BUCKET_NAME=zennote-bucket`

3. Public base URL

   - Current public R2 URL: `https://pub-50ad70a7eabe4f36b7f1d6e21a269101.r2.dev`
   - Set `NEXT_PUBLIC_OG_CDN_BASE_URL` to this value
   - (Optional) Custom domain via Cloudflare: CNAME `cdn.<your-domain>` -> `pub-50ad70a7eabe4f36b7f1d6e21a269101.r2.dev`, orange cloud on

4. Cache policy

   - Cache-Control from uploader: `public, max-age=31536000, immutable`
   - In Cloudflare dashboard, add a Cache Rule for `cdn.<your-domain>/og/*` to cache everything

5. Test
   - Upload a file (or run `npm run og:default`)
   - Verify it loads at `https://cdn.<your-domain>/og/default.png`
   - Confirm response headers show long-lived caching
