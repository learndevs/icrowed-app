import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { Star, Check, X, ChevronRight } from "lucide-react";
import type { BlogPostRecord } from "@/lib/blog-types";
import { normalizeProductImageUrl } from "@/lib/product-image-url";
import { VideoEmbed } from "./VideoEmbed";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogArticle({ post }: { post: BlogPostRecord }) {
  const isReview = post.postType === "review";
  const cover = post.coverImageUrl ? normalizeProductImageUrl(post.coverImageUrl) : null;

  return (
    <article>
      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-sky-50 to-sky-100 shadow-[0_8px_32px_rgba(15,23,42,0.08)]">
        {cover ? (
          <div className="relative aspect-[21/9] max-h-[420px] w-full">
            <Image
              src={cover}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          </div>
        ) : null}

        <div className={`relative px-6 py-8 sm:px-10 sm:py-10 ${cover ? "-mt-16 sm:-mt-20" : ""}`}>
          <div className={`max-w-3xl ${cover ? "rounded-2xl bg-white/95 p-6 shadow-[0_8px_32px_rgba(15,23,42,0.10)] backdrop-blur-sm sm:p-8" : ""}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                {isReview ? "Product Review" : "Blog"}
              </span>
              {(post.brandName || post.productName) && (
                <span className="text-xs font-medium text-zinc-500">
                  {[post.brandName, post.productName].filter(Boolean).join(" · ")}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-zinc-900 sm:text-4xl">
              {post.title}
            </h1>

            {post.excerpt ? (
              <p className="mt-3 text-base leading-relaxed text-zinc-600 sm:text-lg">{post.excerpt}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-4">
              {post.rating ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < post.rating! ? "fill-zinc-900 text-zinc-900" : "fill-zinc-200 text-zinc-200"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-zinc-800">{post.rating}/5</span>
                </div>
              ) : null}
              <time className="text-sm text-zinc-500">{formatDate(post.publishedAt)}</time>
            </div>
          </div>
        </div>
      </header>

      {/* Pros & cons for reviews */}
      {isReview && (post.pros.length > 0 || post.cons.length > 0) && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {post.pros.length > 0 && (
            <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.05)]">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-zinc-900">
                <Check className="h-4 w-4 text-sky-600" />
                Pros
              </h2>
              <ul className="space-y-2">
                {post.pros.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-relaxed text-zinc-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {post.cons.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.05)]">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-zinc-900">
                <X className="h-4 w-4 text-zinc-500" />
                Cons
              </h2>
              <ul className="space-y-2">
                {post.cons.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-relaxed text-zinc-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Body */}
      {post.body?.trim() ? (
        <div className="blog-markdown mt-10 max-w-none text-zinc-700">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="mb-3 mt-8 text-xl font-bold text-zinc-900 first:mt-0">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="mb-2 mt-6 text-lg font-bold text-zinc-900">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 text-base leading-relaxed text-zinc-600">{children}</p>
              ),
              ul: ({ children }) => <ul className="mb-4 list-disc space-y-1 pl-5">{children}</ul>,
              ol: ({ children }) => <ol className="mb-4 list-decimal space-y-1 pl-5">{children}</ol>,
              li: ({ children }) => <li className="text-base leading-relaxed text-zinc-600">{children}</li>,
              strong: ({ children }) => <strong className="font-bold text-zinc-900">{children}</strong>,
              a: ({ href, children }) => (
                <a href={href} className="font-medium text-sky-700 underline hover:text-sky-900">
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="my-6 border-l-4 border-sky-300 bg-sky-50/50 py-3 pl-4 pr-3 italic text-zinc-700">
                  {children}
                </blockquote>
              ),
            }}
          >
            {post.body}
          </ReactMarkdown>
        </div>
      ) : null}

      {/* Gallery */}
      {post.galleryImages.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-zinc-900">Gallery</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {post.galleryImages.map((img) => (
              <figure
                key={img.url}
                className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={normalizeProductImageUrl(img.url)}
                    alt={img.alt ?? post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                {img.caption ? (
                  <figcaption className="px-4 py-3 text-sm text-zinc-600">{img.caption}</figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Videos */}
      {post.videoUrls.length > 0 && (
        <section className="mt-10 space-y-4">
          <h2 className="text-lg font-bold text-zinc-900">Videos</h2>
          {post.videoUrls.map((video) => (
            <VideoEmbed key={video.url} url={video.url} title={video.title} />
          ))}
        </section>
      )}

      {/* Related links / shop CTA */}
      {(post.relatedLinks.length > 0 || post.productId) && (
        <div className="mt-10 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.05)]">
          <h2 className="text-lg font-bold text-zinc-900">Shop &amp; explore</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {post.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
                >
                  {link.label}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
