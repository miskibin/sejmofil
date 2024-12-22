import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["api.sejm.gov.pl"],
  },
  experimental: {
    // dynamicIO: true,
  },
  output: 'standalone',
};

export default nextConfig;
