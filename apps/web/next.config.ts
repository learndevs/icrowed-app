import type { NextConfig } from "next";

const supabaseHost = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return undefined;
  try {
    return new URL(raw).hostname;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  transpilePackages: ["@icrowd/database", "@icrowd/env", "@icrowd/types"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/**" }]
        : []),
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@mui/material",
      "@mui/icons-material",
      "recharts",
    ],
  },
};

export default nextConfig;
