import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: [
      'api.sejm.gov.pl',
      'www.freepik.com',
      'facebook.com',
      'db.msulawiak.pl',
      "platform-lookaside.fbsbx.com",
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
    ],
    minimumCacheTTL: 480,
  },
  experimental: {
    // dynamicIO: true,
  },
  output: 'standalone',
}

export default nextConfig
