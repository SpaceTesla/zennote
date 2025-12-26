import type { NextConfig } from 'next';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Using @cloudflare/next-on-pages for Cloudflare Pages deployment
  // This allows us to use Next.js runtime features instead of static export
  images: {
    unoptimized: true, // Cloudflare handles image optimization
  },
  trailingSlash: true, // Better routing on Cloudflare
  reactStrictMode: true,
};

// Apply bundle analyzer to the next config
export default withBundleAnalyzer(nextConfig);
