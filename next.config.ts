import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["api.sejm.gov.pl"],
    minimumCacheTTL: 480,
  },
  experimental: {
    // dynamicIO: true,
  },
  output: 'standalone'
};

export default nextConfig;
