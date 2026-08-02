import type { Metadata } from "next";
import Link from "next/link";
import { listGuides } from "@/lib/guides";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "Buying Guides — Prices in Sri Lanka",
  description:
    "iCrowd guides for iPhone, Anker earbuds, DJI drones and more in Sri Lanka — prices, pickup in Kandy, Kottawa & Matara, and island-wide delivery.",
  path: "/guides",
});

export default function GuidesIndexPage() {
  const guides = listGuides();

  return (
    <div className="min-h-[60vh] bg-white">
      <section className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-5 lg:px-8 lg:pt-10">
        <div className="rounded-3xl bg-[#F5F5F5] px-8 py-14 sm:px-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
            Buying Guides
          </h1>
          <p className="mt-4 max-w-2xl text-base text-zinc-600 leading-relaxed">
            Price and shopping guides for Apple, Anker and DJI in Sri Lanka — plus
            local pickup tips for Kandy, Kottawa and Matara.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-4 py-10 sm:px-5 lg:px-8">
        <ul className="space-y-3">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/guides/${guide.slug}`}
                className="block rounded-2xl border border-zinc-200 bg-[#F9F9F9] px-6 py-5 hover:bg-white hover:border-zinc-300 transition-colors"
              >
                <h2 className="text-lg font-bold text-black">{guide.title}</h2>
                <p className="mt-1 text-sm text-zinc-600 leading-relaxed">
                  {guide.description}
                </p>
                <p className="mt-2 text-xs text-zinc-400">
                  Updated {guide.updatedAt}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
