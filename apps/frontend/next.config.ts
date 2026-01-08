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
  // Optimize for smaller bundles
  webpack: (config, { isServer }) => {
    // Minimize bundle size for edge runtime
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Use lighter shiki bundle
        shiki: 'shiki/bundle/web',
      };
    }
    return config;
  },
};

// Only apply bundle analyzer when not using Turbopack (bundle analyzer is webpack-only)
const isTurbopack = process.argv.includes('--turbopack') || process.env.TURBOPACK === '1';

export default isTurbopack ? nextConfig : withBundleAnalyzer(nextConfig);
