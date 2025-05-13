import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Default port
const DEFAULT_PORT = 3000;

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_PORT: process.env.PORT || String(DEFAULT_PORT)
  },
  // External packages that should be bundled by the server
  serverExternalPackages: ['mongoose'],
  // Wyłączam tracing, który powodował błąd EPERM
  experimental: {
    optimizeCss: true, // Analizuje CSS podczas kompilacji
  }
};

export default withBundleAnalyzer(nextConfig);
