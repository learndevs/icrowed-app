import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getPublishedBlogPostBySlug } from "@icrowd/database/queries";
import { BlogArticle } from "@/components/blog/BlogArticle";
import { absoluteUrl, buildPageMetadata, serializeJsonLd } from "@/lib/seo";
import type { BlogPostRecord } from "@/lib/blog-types";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return buildPageMetadata({ title: "Blog", path: `/blog/${slug}` });
  return buildPageMetadata({
    title: post.title,
    description: post.excerpt ?? post.title,
    path: `/blog/${slug}`,
    ...(post.coverImageUrl ? { image: post.coverImageUrl } : {}),
  });
}

function toRecord(row: NonNullable<Awaited<ReturnType<typeof getPublishedBlogPostBySlug>>>): BlogPostRecord {
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

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const row = await getPublishedBlogPostBySlug(slug);
  if (!row) notFound();

  const post = toRecord(row);
  const isReview = post.postType === "review";

  const articleJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": isReview ? "Review" : "Article",
    headline: post.title,
    description: post.excerpt ?? post.title,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: "iCrowd" },
    publisher: { "@type": "Organization", name: "iCrowd", url: absoluteUrl("/") },
    mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
    ...(post.coverImageUrl ? { image: absoluteUrl(post.coverImageUrl) } : {}),
    ...(isReview && post.rating
      ? {
          reviewRating: {
            "@type": "Rating",
            ratingValue: post.rating,
            bestRating: 5,
          },
          itemReviewed: {
            "@type": "Product",
            name: post.productName ?? post.title,
            ...(post.brandName ? { brand: { "@type": "Brand", name: post.brandName } } : {}),
          },
        }
      : {}),
  };

  return (
    <div className="min-h-[60vh] bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />

      <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-5 lg:px-8">
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-zinc-400">
          <Link href="/" className="hover:text-zinc-700">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/blog" className="hover:text-zinc-700">
            Blog
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1 font-medium text-zinc-700">{post.title}</span>
        </nav>

        <BlogArticle post={post} />
      </div>
    </div>
  );
}
