import { HomeHero } from "@/components/home/HomeHero";
import { CategoryShowcaseCards } from "@/components/home/CategoryShowcaseCards";
import { TopSellingProductsSection } from "@/components/home/TopSellingProductsSection";
import { HomeReviewsSection } from "@/components/home/HomeReviewsSection";
import { HomeOffersSection } from "@/components/home/HomeOffersSection";
import { STOREFRONT_REVALIDATE_SECONDS } from "@/lib/storefront-cache";

/** ISR: refresh home catalog sections every minute instead of every request. */
export const revalidate = STOREFRONT_REVALIDATE_SECONDS;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  return (
    <div className="bento-bg">
      <HomeHero />

      <CategoryShowcaseCards />

      <TopSellingProductsSection />

      <HomeReviewsSection />

      <HomeOffersSection />
    </div>
  );
}
