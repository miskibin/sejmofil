import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["api.sejm.gov.pl"],
  },
  experimental: {
    // dynamicIO: true,
  },
};

export default nextConfig;
