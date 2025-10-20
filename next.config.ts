import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.sejm.gov.pl' },
      { protocol: 'https', hostname: 'www.freepik.com' },
      { protocol: 'https', hostname: 'facebook.com' },
      { protocol: 'https', hostname: 'db.msulawiak.pl' },
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year for static images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    // ppr: 'incremental', // Requires Next.js canary - enable when upgrading
    // reactCompiler: true, // Requires babel-plugin-react-compiler to be installed
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  output: 'standalone',
  compress: true,
  reactStrictMode: true,
}

export default nextConfig
