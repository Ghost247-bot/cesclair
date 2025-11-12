import type { NextConfig } from "next";
import path from "node:path";

const LOADER = path.resolve(__dirname, 'src/visual-edits/component-tagger-loader.js');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Optimize images for Netlify
    formats: ['image/avif', 'image/webp'],
    // Ensure images work on Netlify
    unoptimized: false,
    // Add loader for better compatibility
    loader: 'default',
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure output is compatible with Netlify
  // Don't use 'export' output mode - Netlify plugin handles this
  // output is undefined by default, which is correct for Netlify
  // Temporarily disabled Turbopack custom loader to fix "Next.js package not found" error
  // turbopack: {
  //   rules: {
  //     "*.{jsx,tsx}": {
  //       loaders: [LOADER]
  //     }
  //   }
  // }
};

export default nextConfig;
// Orchids restart: 1762699889068