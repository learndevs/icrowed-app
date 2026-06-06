import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { CategoryShowcaseCards } from "@/components/home/CategoryShowcaseCards";
import { TopSellingProductsSection } from "@/components/home/TopSellingProductsSection";
import { HomeReviewsSection } from "@/components/home/HomeReviewsSection";
import { HomeOffersSection } from "@/components/home/HomeOffersSection";
import { getOrCreateStoreSettings } from "@icrowd/database";
import { formatAddress, parseStoreContactInfo } from "@/lib/contact-page";
import { getStorefrontContactInfoSafe } from "@/lib/contact-page.server";
import { queryStorefront } from "@/lib/storefront-query";
import {
  DEFAULT_DESCRIPTION,
  absoluteUrl,
  buildPageMetadata,
  serializeJsonLd,
} from "@/lib/seo";

/** ISR: refresh home catalog sections every 60s instead of every request. */
export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "iCrowd — Mobile Phones & Accessories in Sri Lanka",
  absoluteTitle: true,
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const [settings, contactInfo] = await Promise.all([
    queryStorefront("home-org", () => getOrCreateStoreSettings()).catch(() => null),
    getStorefrontContactInfoSafe(),
  ]);

  const storeName = settings?.storeName?.trim() || "iCrowd";
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: storeName,
    url: absoluteUrl("/"),
    ...(settings?.logoUrl ? { logo: absoluteUrl(settings.logoUrl) } : {}),
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
    ...(formatAddress(contactInfo)
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: [contactInfo.addressLine1, contactInfo.addressLine2]
              .filter(Boolean)
              .join(", "),
            addressLocality: contactInfo.city || undefined,
            addressCountry: contactInfo.country || "Sri Lanka",
          },
        }
      : {}),
  };

  return (
    <div className="bento-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
      />
      <HomeHero />

      <CategoryShowcaseCards />

      <TopSellingProductsSection />

      <HomeReviewsSection />

      <HomeOffersSection />
    </div>
  );
}
