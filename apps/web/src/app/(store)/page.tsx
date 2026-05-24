import { HomeHero } from "@/components/home/HomeHero";
import { CategoryShowcaseCards } from "@/components/home/CategoryShowcaseCards";
import { TopSellingProductsSection } from "@/components/home/TopSellingProductsSection";
import { HomeReviewsSection } from "@/components/home/HomeReviewsSection";
import { HomeOffersSection } from "@/components/home/HomeOffersSection";

// ISR — regenerate the home page at most once a minute. Bursts of traffic
// share the same cached HTML instead of hammering Supabase per request.
export const revalidate = 60;

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
