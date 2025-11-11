import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Explicitly set the workspace root to fix environment variable loading
  experimental: {
    // This ensures .env.local is read from the project root
  },
};

export default nextConfig;
