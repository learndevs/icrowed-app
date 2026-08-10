import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, Phone, Clock } from "lucide-react";
import {
  ensureDefaultStoreLocations,
  getActiveStoreLocations,
  getOrCreateStoreSettings,
  getStoreLocationBySlug,
} from "@icrowd/database";
import {
  getProductsByCategorySlug,
  getProductsByBrandSlug,
  getTopSellingProducts,
} from "@icrowd/database/queries";
import { getStorefrontContactInfoSafe } from "@/lib/contact-page.server";
import { queryStorefront } from "@/lib/storefront-query";
import {
  absoluteUrl,
  buildPageMetadata,
  serializeJsonLd,
  socialSameAs,
  SITE_NAME,
} from "@/lib/seo";
import { buildPriceListData } from "@/lib/price-list";
import { PriceListBlock } from "@/components/seo/PriceListBlock";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

const CITY_TITLE: Record<string, string> = {
  kandy: "iPhone Shop in Kandy — Buy iPhone Kandy",
  kottawa: "Anker Pickup in Kottawa",
  matara: "Earbuds & Anker Pickup Matara",
};

const CITY_DESCRIPTION: Record<string, string> = {
  kandy:
    "Buy iPhone in Kandy at the iCrowd shop — iPhone 17 Pro Max, 16 Pro Max and more with live LKR prices. Genuine Apple, same-day pickup when in stock, bank transfer & COD options, island-wide delivery.",
  kottawa:
    "Order Anker chargers, earbuds and power banks online and pick up in Kottawa — genuine products, live Sri Lanka prices at iCrowd.",
  matara:
    "Buy earbuds in Matara via iCrowd pickup — Anker Soundcore and more with island-wide delivery across Sri Lanka.",
};

/** Product lines highlighted per location — feeds the on-page mini price list. */
const LOCATION_PRODUCT_SOURCES: Record<
  string,
  { categorySlug?: string; brandSlug?: string }[]
> = {
  kandy: [{ categorySlug: "phones" }, { categorySlug: "earbuds" }],
  kottawa: [{ brandSlug: "anker" }],
  matara: [{ categorySlug: "earbuds" }],
};

async function getLocationProducts(slug: string) {
  const sources = LOCATION_PRODUCT_SOURCES[slug] ?? [];
  const results = await Promise.all(
    sources.map((src) =>
      src.categorySlug
        ? getProductsByCategorySlug(src.categorySlug, { limit: 20 })
        : src.brandSlug
          ? getProductsByBrandSlug(src.brandSlug, { limit: 20 })
          : Promise.resolve([]),
    ),
  );
  const merged = results.flat();
  return merged.length > 0 ? merged : getTopSellingProducts();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const location = await queryStorefront("location-meta", async () => {
    await ensureDefaultStoreLocations().catch(() => null);
    return getStoreLocationBySlug(slug);
  }).catch(() => null);

  if (!location) {
    return buildPageMetadata({ title: "Location", path: `/locations/${slug}` });
  }

  const title =
    CITY_TITLE[slug] ||
    `${location.name} — ${location.type === "store" ? "Shop" : "Pickup"} in ${location.city}`;
  const description =
    CITY_DESCRIPTION[slug] ||
    location.description?.trim() ||
    `${location.name}: buy Apple, Anker and DJI products with ${
      location.type === "store" ? "in-store shopping" : "order pickup"
    } in ${location.city}, Sri Lanka. Island-wide delivery available.`;

  return buildPageMetadata({
    title,
    description,
    path: `/locations/${slug}`,
  });
}

export default async function LocationDetailPage({ params }: Props) {
  const { slug } = await params;
  const [location, allLocations, contactInfo, settings, locationProducts] = await Promise.all([
    queryStorefront("location", async () => {
      await ensureDefaultStoreLocations().catch(() => null);
      return getStoreLocationBySlug(slug);
    }),
    queryStorefront("locations-all", () => getActiveStoreLocations()).catch(() => []),
    getStorefrontContactInfoSafe(),
    queryStorefront("location-settings", () => getOrCreateStoreSettings()).catch(() => null),
    queryStorefront("location-products", () => getLocationProducts(slug)).catch(() => []),
  ]);

  if (!location) notFound();

  const priceList = buildPriceListData(locationProducts, { limit: 8 });

  const social = (settings?.socialLinks ?? {}) as Record<string, string>;
  const sameAs = socialSameAs({
    facebook: social.facebook || contactInfo.social.facebook,
    instagram: social.instagram || contactInfo.social.instagram,
    twitter: social.twitter,
    tiktok: social.tiktok,
    youtube: social.youtube,
  });

  const pageUrl = absoluteUrl(`/locations/${slug}`);
  const phone = location.phone || contactInfo.phone;

  const localBusinessJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": location.type === "store" ? "ElectronicsStore" : "Store",
    "@id": `${pageUrl}#localbusiness`,
    name: location.name,
    description: location.description,
    url: pageUrl,
    parentOrganization: {
      "@type": "Organization",
      name: settings?.storeName?.trim() || SITE_NAME,
      url: absoluteUrl("/"),
      "@id": absoluteUrl("/#organization"),
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: [location.addressLine1, location.addressLine2]
        .filter(Boolean)
        .join(", "),
      addressLocality: location.city,
      addressCountry: location.country || "Sri Lanka",
    },
    areaServed: [
      { "@type": "City", name: location.city },
      { "@type": "Country", name: "Sri Lanka" },
    ],
    ...(phone ? { telephone: phone } : {}),
    ...(location.hours ? { openingHours: location.hours } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  if (location.latitude && location.longitude) {
    localBusinessJsonLd.geo = {
      "@type": "GeoCoordinates",
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
    };
  }

  const otherLocations = allLocations.filter((l) => l.slug !== slug);

  return (
    <div className="min-h-[60vh] bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(localBusinessJsonLd) }}
      />

      <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-5 lg:px-8">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/locations" className="hover:text-gray-700">
            Locations
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium">{location.city}</span>
        </nav>

        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">
          {location.type === "store" ? "Full shop" : "Pickup point"}
        </p>
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
          {CITY_TITLE[slug] || location.name}
        </h1>
        <p className="mt-4 text-base text-zinc-600 leading-relaxed">
          {location.description}
        </p>

        <div className="mt-8 space-y-4 rounded-2xl border border-zinc-200 bg-[#F9F9F9] p-6">
          <div className="flex items-start gap-3 text-sm text-zinc-700">
            <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-black">Address</p>
              <p>
                {[location.addressLine1, location.addressLine2, location.city, location.country]
                  .filter(Boolean)
                  .join(", ") || `${location.city}, Sri Lanka`}
              </p>
            </div>
          </div>
          {phone ? (
            <div className="flex items-start gap-3 text-sm text-zinc-700">
              <Phone className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-black">Phone</p>
                <a href={`tel:${phone}`} className="hover:underline">
                  {phone}
                </a>
              </div>
            </div>
          ) : null}
          {location.hours ? (
            <div className="flex items-start gap-3 text-sm text-zinc-700">
              <Clock className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-black">Hours</p>
                <p>{location.hours}</p>
              </div>
            </div>
          ) : null}
        </div>

        {location.mapEmbedUrl ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 aspect-video">
            <iframe
              src={location.mapEmbedUrl}
              title={`Map — ${location.name}`}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        ) : null}

        <section className="mt-10">
          <h2 className="text-xl font-bold text-black mb-3">What you can buy</h2>
          <p className="text-sm text-zinc-600 mb-4">
            {location.type === "store"
              ? `Browse iPhones, Anker chargers & power banks, DJI drones, earbuds and more at our ${location.city} shop — or order online for delivery.`
              : `Order online and pick up in ${location.city}, or choose island-wide delivery.`}
          </p>
          {priceList ? (
            <PriceListBlock
              heading={`Prices in ${location.city}`}
              priceList={priceList}
              note={`Same price whether you buy online, in-store, or for ${location.city} pickup.`}
            />
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/categories/phones"
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              iPhones & phones
            </Link>
            <Link
              href="/products/brands/anker"
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Anker
            </Link>
            <Link
              href="/products/brands/dji"
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              DJI
            </Link>
            <Link
              href="/categories/earbuds"
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Earbuds
            </Link>
            <Link
              href="/guides"
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Buying guides
            </Link>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-black mb-3">Delivery to {location.city}</h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Prefer home delivery? We deliver island-wide across Sri Lanka, including {location.city}.
            Checkout shows delivery options and fees before you pay.{" "}
            <Link href="/contact" className="underline font-medium text-black">
              Contact us
            </Link>{" "}
            for pickup appointments.
          </p>
        </section>

        {otherLocations.length > 0 ? (
          <section className="mt-10 border-t border-zinc-200 pt-8">
            <h2 className="text-lg font-bold text-black mb-3">Other locations</h2>
            <ul className="space-y-2">
              {otherLocations.map((loc) => (
                <li key={loc.id}>
                  <Link
                    href={`/locations/${loc.slug}`}
                    className="text-sm font-medium text-sky-700 hover:underline"
                  >
                    {loc.name} ({loc.type === "store" ? "shop" : "pickup"})
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
