import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@icrowed/database", "@icrowed/env", "@icrowed/types"],
};

export default nextConfig;
