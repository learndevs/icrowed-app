import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getGuideBySlug, listGuides } from "@/lib/guides";
import { absoluteUrl, buildPageMetadata, serializeJsonLd } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return listGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return buildPageMetadata({ title: "Guide", path: `/guides/${slug}` });
  return buildPageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${slug}`,
  });
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    dateModified: guide.updatedAt,
    author: { "@type": "Organization", name: "iCrowd" },
    publisher: { "@type": "Organization", name: "iCrowd", url: absoluteUrl("/") },
    mainEntityOfPage: absoluteUrl(`/guides/${slug}`),
  };

  return (
    <div className="min-h-[60vh] bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />

      <article className="mx-auto max-w-[720px] px-4 py-8 sm:px-5 lg:px-8">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/guides" className="hover:text-gray-700">
            Guides
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium line-clamp-1">{guide.title}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-tight">
          {guide.title}
        </h1>
        <p className="mt-4 text-base text-zinc-600 leading-relaxed">{guide.description}</p>

        <div className="mt-8 space-y-8">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold text-black mb-2">{section.heading}</h2>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-200 bg-[#F9F9F9] p-6">
          <h2 className="text-lg font-bold text-black mb-3">Shop related products</h2>
          <ul className="flex flex-wrap gap-2">
            {guide.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  );
}
