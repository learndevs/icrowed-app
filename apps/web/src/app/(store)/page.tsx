import { HomeHero } from "@/components/home/HomeHero";
import { CategoryShowcaseCards } from "@/components/home/CategoryShowcaseCards";
import { TopSellingProductsSection } from "@/components/home/TopSellingProductsSection";
import { HomeReviewsSection } from "@/components/home/HomeReviewsSection";
import { HomeOffersSection } from "@/components/home/HomeOffersSection";

/** Load top selling + offers from DB on every request (avoid empty build-time cache). */
export const dynamic = "force-dynamic";

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
