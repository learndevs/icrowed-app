import Link from "next/link";
import { getActiveOffers } from "@icrowd/database/queries";
import { HomeOffersCarousel } from "./HomeOffersCarousel";
import type { OfferCardItem } from "@/components/offers/OfferCard";
import { queryStorefront } from "@/lib/storefront-query";

const HOME_OFFERS_LIMIT = 6;

function mapOffer(
  o: Awaited<ReturnType<typeof getActiveOffers>>[number],
): OfferCardItem {
  return {
    id: o.id,
    title: o.title,
    description: o.description,
    imageUrl: o.imageUrl,
    linkUrl: o.linkUrl,
    instagramUrl: o.instagramUrl,
  };
}

export async function HomeOffersSection() {
  const rows = await queryStorefront("home-offers", () => getActiveOffers());
  const offers = rows.slice(0, HOME_OFFERS_LIMIT).map(mapOffer);

  if (offers.length === 0) return null;

  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-5 lg:px-8">
        <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
          <h2 className="type-section-heading text-zinc-900">Offers</h2>
          <Link
            href="/offers"
            className="mt-2 type-link text-zinc-600 transition hover:text-zinc-900"
          >
            See more &rsaquo;
          </Link>
        </div>

        <HomeOffersCarousel offers={offers} />
      </div>
    </section>
  );
}
