import type { MetadataRoute } from "next";
import {
  getActiveBrandSitemapEntries,
  getActiveCategorySitemapEntries,
  getActiveProductSitemapEntries,
  getActiveStoreLocations,
  getPublishedBlogPosts,
} from "@icrowd/database/queries";
import { listGuides } from "@/lib/guides";
import { siteUrl } from "@/lib/seo";

export const revalidate = 3600;

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/products", priority: 0.8, changeFrequency: "daily" },
  { path: "/categories", priority: 0.8, changeFrequency: "weekly" },
  { path: "/offers", priority: 0.8, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.5, changeFrequency: "monthly" },
  { path: "/locations", priority: 0.8, changeFrequency: "monthly" },
  { path: "/guides", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.85, changeFrequency: "weekly" },
  { path: "/iphone-price-sri-lanka", priority: 0.95, changeFrequency: "daily" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl().origin;
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const guideEntries: MetadataRoute.Sitemap = listGuides().map((guide) => ({
    url: `${base}/guides/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  try {
    const [products, brands, categories, locations, blogPosts] = await Promise.all([
      getActiveProductSitemapEntries(),
      getActiveBrandSitemapEntries(),
      getActiveCategorySitemapEntries(),
      getActiveStoreLocations().catch(() => []),
      getPublishedBlogPosts().catch(() => []),
    ]);

    const productEntries: MetadataRoute.Sitemap = products.map((row) => ({
      url: `${base}/products/${row.slug}`,
      lastModified: row.updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    const brandEntries: MetadataRoute.Sitemap = brands.map((row) => ({
      url: `${base}/products/brands/${row.slug}`,
      lastModified: row.createdAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const categoryEntries: MetadataRoute.Sitemap = categories.map((row) => ({
      url: `${base}/categories/${row.slug}`,
      lastModified: row.updatedAt,
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    const locationEntries: MetadataRoute.Sitemap = locations.map((row) => ({
      url: `${base}/locations/${row.slug}`,
      lastModified: row.updatedAt,
      changeFrequency: "weekly" as const,
      priority: row.slug === "kandy" ? 0.9 : 0.8,
    }));

    const blogEntries: MetadataRoute.Sitemap = blogPosts.map((row) => ({
      url: `${base}/blog/${row.slug}`,
      lastModified: row.updatedAt,
      changeFrequency: "weekly" as const,
      priority: row.postType === "review" ? 0.75 : 0.7,
    }));

    return [
      ...staticEntries,
      ...guideEntries,
      ...blogEntries,
      ...productEntries,
      ...brandEntries,
      ...categoryEntries,
      ...locationEntries,
    ];
  } catch (err) {
    console.error("[sitemap] DB query failed, returning static + guide routes only:", err);
    return [...staticEntries, ...guideEntries];
  }
}
