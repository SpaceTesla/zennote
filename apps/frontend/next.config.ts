import type { NextConfig } from 'next';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Using @cloudflare/next-on-pages for Cloudflare Pages deployment
  images: {
    unoptimized: true, // Cloudflare handles image optimization
  },
  trailingSlash: true,
  reactStrictMode: true,
  experimental: {
    turbo: {
      // Turbopack configuration
    },
  },
};

// Only apply bundle analyzer when not using Turbopack (bundle analyzer is webpack-only)
const isTurbopack = process.argv.includes('--turbopack') || process.env.TURBOPACK === '1';

export default isTurbopack ? nextConfig : withBundleAnalyzer(nextConfig);
