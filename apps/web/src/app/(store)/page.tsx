import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { CategoryShowcaseCards } from "@/components/home/CategoryShowcaseCards";
import { TopSellingProductsSection } from "@/components/home/TopSellingProductsSection";
import { HomeReviewsSection } from "@/components/home/HomeReviewsSection";
import { HomeOffersSection } from "@/components/home/HomeOffersSection";
import {
  getActiveStoreLocations,
  getOrCreateStoreSettings,
  ensureDefaultStoreLocations,
} from "@icrowd/database";
import { formatAddress } from "@/lib/contact-page";
import { getStorefrontContactInfoSafe } from "@/lib/contact-page.server";
import { queryStorefront } from "@/lib/storefront-query";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  absoluteUrl,
  buildPageMetadata,
  serializeJsonLd,
  socialSameAs,
} from "@/lib/seo";

/** ISR: refresh home catalog sections every 60s instead of every request. */
export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: DEFAULT_TITLE,
  absoluteTitle: true,
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const [settings, contactInfo, locations] = await Promise.all([
    queryStorefront("home-org", () => getOrCreateStoreSettings()).catch(() => null),
    getStorefrontContactInfoSafe(),
    queryStorefront("home-locations", async () => {
      await ensureDefaultStoreLocations().catch(() => null);
      return getActiveStoreLocations();
    }).catch(() => []),
  ]);

  const storeName = settings?.storeName?.trim() || "iCrowd";
  const social = (settings?.socialLinks ?? {}) as Record<string, string>;
  const sameAs = socialSameAs({
    facebook: social.facebook || contactInfo.social.facebook,
    instagram: social.instagram || contactInfo.social.instagram,
    twitter: social.twitter,
    tiktok: social.tiktok,
    youtube: social.youtube,
  });

  const kandy =
    locations.find((l) => l.slug === "kandy") ??
    locations.find((l) => l.type === "store") ??
    null;

  const organizationJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["Organization", "ElectronicsStore"],
    "@id": absoluteUrl("/#organization"),
    name: storeName,
    url: absoluteUrl("/"),
    ...(settings?.logoUrl ? { logo: absoluteUrl(settings.logoUrl) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    areaServed: [
      { "@type": "Country", name: "Sri Lanka" },
      ...locations.map((l) => ({ "@type": "City", name: l.city })),
    ],
    ...(contactInfo.email || contactInfo.phone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            ...(contactInfo.phone ? { telephone: contactInfo.phone } : {}),
            ...(contactInfo.email ? { email: contactInfo.email } : {}),
            contactType: "customer service",
            areaServed: "LK",
          },
        }
      : {}),
    ...(formatAddress(contactInfo) || kandy
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: [
              kandy?.addressLine1 || contactInfo.addressLine1,
              kandy?.addressLine2 || contactInfo.addressLine2,
            ]
              .filter(Boolean)
              .join(", "),
            addressLocality: kandy?.city || contactInfo.city || "Kandy",
            addressCountry: kandy?.country || contactInfo.country || "Sri Lanka",
          },
        }
      : {}),
  };

  const localBusinessNodes = locations.map((loc) => {
    const locUrl = absoluteUrl(`/locations/${loc.slug}`);
    const node: Record<string, unknown> = {
      "@type": loc.type === "store" ? "ElectronicsStore" : "Store",
      "@id": `${locUrl}#localbusiness`,
      name: loc.name,
      url: locUrl,
      parentOrganization: { "@id": absoluteUrl("/#organization") },
      address: {
        "@type": "PostalAddress",
        streetAddress: [loc.addressLine1, loc.addressLine2].filter(Boolean).join(", "),
        addressLocality: loc.city,
        addressCountry: loc.country || "Sri Lanka",
      },
      areaServed: { "@type": "City", name: loc.city },
      ...(loc.phone ? { telephone: loc.phone } : contactInfo.phone ? { telephone: contactInfo.phone } : {}),
      ...(loc.hours ? { openingHours: loc.hours } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    };
    if (loc.latitude && loc.longitude) {
      node.geo = {
        "@type": "GeoCoordinates",
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
      };
    }
    return node;
  });

  const graphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [organizationJsonLd, ...localBusinessNodes],
  };

  return (
    <div className="bento-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(graphJsonLd) }}
      />
      <HomeHero />

      <CategoryShowcaseCards />

      <TopSellingProductsSection />

      <HomeReviewsSection />

      <HomeOffersSection />
    </div>
  );
}
