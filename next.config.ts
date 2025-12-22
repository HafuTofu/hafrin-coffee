import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Lint errors won't block production builds (helpful while upgrading)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
