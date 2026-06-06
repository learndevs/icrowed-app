import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/operator",
        "/api",
        "/checkout",
        "/cart",
        "/wishlist",
        "/track",
        "/account",
      ],
    },
    sitemap: `${siteUrl().origin}/sitemap.xml`,
  };
}
