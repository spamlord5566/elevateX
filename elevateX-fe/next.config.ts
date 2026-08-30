import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // TODO: Add real image domains when integrating Cloudinary/S3
  images: {
    remotePatterns: [],
  },
  // Turbopack is stable in Next 15 — use it for faster dev
  // experimental: { turbopack: true },
};

export default nextConfig;
