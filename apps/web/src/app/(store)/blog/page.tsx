import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedBlogPosts } from "@icrowd/database/queries";
import { BlogCard } from "@/components/blog/BlogCard";
import { buildPageMetadata } from "@/lib/seo";
import type { BlogPostRecord } from "@/lib/blog-types";

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: "Blog & Reviews",
  description:
    "Expert product reviews, hands-on impressions, and buying guides from iCrowd — phones, earbuds, drones, and accessories in Sri Lanka.",
  path: "/blog",
});

function toRecord(row: Awaited<ReturnType<typeof getPublishedBlogPosts>>[number]): BlogPostRecord {
  return {
    ...row,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    galleryImages: row.galleryImages ?? [],
    videoUrls: row.videoUrls ?? [],
    pros: row.pros ?? [],
    cons: row.cons ?? [],
    relatedLinks: row.relatedLinks ?? [],
  };
}

export default async function BlogIndexPage() {
  const rows = await getPublishedBlogPosts();
  const posts = rows.map(toRecord);
  const reviews = posts.filter((p) => p.postType === "review");
  const articles = posts.filter((p) => p.postType !== "review");

  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-sky-50 via-white to-white">
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-5 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 shadow-sm">
            Blog &amp; Reviews
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
            Honest reviews &amp; buying insights
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-600">
            Hands-on product reviews, comparisons, and tips from the iCrowd team — written for shoppers in Sri Lanka.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="mx-auto mt-12 max-w-md rounded-3xl border border-sky-100 bg-white p-8 text-center shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
            <p className="text-zinc-600">New reviews and articles are on the way. Check back soon.</p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-12 space-y-12">
            {reviews.length > 0 && (
              <section>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <h2 className="text-2xl font-bold text-zinc-900">Product reviews</h2>
                  <span className="text-sm text-zinc-500">{reviews.length} reviews</span>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {reviews.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {articles.length > 0 && (
              <section>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <h2 className="text-2xl font-bold text-zinc-900">Articles</h2>
                  <span className="text-sm text-zinc-500">{articles.length} articles</span>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {articles.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
