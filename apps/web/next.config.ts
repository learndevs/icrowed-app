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

const appHost = (() => {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  if (!raw) return undefined;
  try {
    return new URL(raw).hostname;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  transpilePackages: ["@icrowd/database", "@icrowd/env", "@icrowd/types"],
  async headers() {
    return [
      {
        source: "/home/categories/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(appHost
        ? [
            {
              protocol: "https" as const,
              hostname: appHost,
              pathname: "/uploads/**",
            },
            {
              protocol: "http" as const,
              hostname: appHost,
              pathname: "/uploads/**",
            },
          ]
        : []),
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
