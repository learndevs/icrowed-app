import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@icrowed/database", "@icrowed/env", "@icrowed/types"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
