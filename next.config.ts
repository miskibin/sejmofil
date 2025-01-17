import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['api.sejm.gov.pl', 'www.freepik.com', 'db.msulawiak.pl'],
    minimumCacheTTL: 480,
  },
  experimental: {
    // dynamicIO: true,
  },
  output: 'standalone',
}

export default nextConfig
