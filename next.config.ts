import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow serving uploaded videos and thumbnails from public/uploads
  images: {
    unoptimized: true,
  },

  // Increase body size limit for video uploads (500MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },

  // Allow other devices on local network
  allowedDevOrigins: ['172.17.55.48', 'localhost', 'common-otters-teach.loca.lt', 'loca.lt'],

  // Mark native/binary node modules as external so Turbopack doesn't try to bundle them
  serverExternalPackages: [
    'fluent-ffmpeg',
    '@ffmpeg-installer/ffmpeg',
    'ffmpeg-static',
    'ffprobe-static',
    '@prisma/client',
    'prisma',
  ],

  // Allow large response bodies for video streaming
  async headers() {
    return [
      {
        source: '/api/videos/:path*',
        headers: [
          { key: 'Accept-Ranges', value: 'bytes' },
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ];
  },
};

export default nextConfig;
