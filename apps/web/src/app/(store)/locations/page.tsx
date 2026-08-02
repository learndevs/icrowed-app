import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Store, Package } from "lucide-react";
import {
  ensureDefaultStoreLocations,
  getActiveStoreLocations,
} from "@icrowd/database";
import { queryStorefront } from "@/lib/storefront-query";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: "Store & Pickup Locations in Sri Lanka",
  description:
    "Visit iCrowd in Kandy or pick up orders in Kottawa and Matara. Apple, Anker and DJI products with island-wide delivery across Sri Lanka.",
  path: "/locations",
});

export default async function LocationsIndexPage() {
  const locations = await queryStorefront("locations-index", async () => {
    await ensureDefaultStoreLocations().catch(() => null);
    return getActiveStoreLocations();
  }).catch(() => []);

  return (
    <div className="min-h-[60vh] bg-white">
      <section className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-5 lg:px-8 lg:pt-10">
        <div className="rounded-3xl bg-[#F5F5F5] px-8 py-14 sm:px-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
            Our Locations in Sri Lanka
          </h1>
          <p className="mt-4 max-w-2xl text-base text-zinc-600 leading-relaxed">
            Shop in person at our Kandy store, collect orders at Kottawa or Matara
            pickup points, or get island-wide delivery for iPhones, Anker, DJI and
            earbuds.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-5 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <Link
              key={loc.id}
              href={`/locations/${loc.slug}`}
              className="rounded-2xl border border-zinc-200 bg-[#F9F9F9] p-6 hover:bg-white hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-zinc-500 mb-3">
                {loc.type === "store" ? (
                  <Store className="w-4 h-4" />
                ) : (
                  <Package className="w-4 h-4" />
                )}
                {loc.type === "store" ? "Full shop" : "Pickup point"}
              </div>
              <h2 className="text-xl font-bold text-black">{loc.name}</h2>
              <p className="mt-2 flex items-start gap-2 text-sm text-zinc-600">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                {[loc.addressLine1, loc.city].filter(Boolean).join(", ") || loc.city}
              </p>
              {loc.description ? (
                <p className="mt-3 text-sm text-zinc-500 line-clamp-3 leading-relaxed">
                  {loc.description}
                </p>
              ) : null}
              <span className="mt-4 inline-block text-sm font-semibold text-sky-700">
                View details →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
