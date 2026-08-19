import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import type { BlogPostRecord } from "@/lib/blog-types";
import { normalizeProductImageUrl } from "@/lib/product-image-url";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "fill-zinc-900 text-zinc-900" : "fill-zinc-200 text-zinc-200"}`}
        />
      ))}
    </div>
  );
}

export function BlogCard({ post }: { post: BlogPostRecord }) {
  const cover = post.coverImageUrl
    ? normalizeProductImageUrl(post.coverImageUrl)
    : post.galleryImages[0]?.url
      ? normalizeProductImageUrl(post.galleryImages[0].url)
      : null;

  const isReview = post.postType === "review";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(15,23,42,0.10)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-sky-50 to-sky-100">
        {cover ? (
          <Image
            src={cover}
            alt={post.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
              {isReview ? "Review" : "Article"}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-800 shadow-sm backdrop-blur-sm">
            {isReview ? "Review" : "Blog"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {(post.brandName || post.productName) && (
          <p className="text-xs font-medium uppercase tracking-wide text-sky-600">
            {[post.brandName, post.productName].filter(Boolean).join(" · ")}
          </p>
        )}
        <h2 className="mt-1.5 line-clamp-2 text-lg font-bold leading-snug text-zinc-900 group-hover:text-sky-800">
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600">{post.excerpt}</p>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex flex-col gap-1">
            {post.rating ? <StarRating rating={post.rating} /> : null}
            <time className="text-xs text-zinc-400">{formatDate(post.publishedAt)}</time>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-zinc-900">
            Read
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
