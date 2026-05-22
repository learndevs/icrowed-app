import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@icrowd/database", "@icrowd/env", "@icrowd/types"],
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
