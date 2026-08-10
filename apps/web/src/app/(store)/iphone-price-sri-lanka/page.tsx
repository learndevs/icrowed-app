import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProductsByCategorySlug, getReviewSummariesForProducts } from "@icrowd/database/queries";
import { queryStorefront } from "@/lib/storefront-query";
import { mapProductToCardData } from "@/lib/product-card-map";
import {
  absoluteUrl,
  buildFaqJsonLd,
  buildPageMetadata,
  serializeJsonLd,
} from "@/lib/seo";
import { buildBudgetTiers, buildPriceListData, formatLkr } from "@/lib/price-list";
import { PriceListBlock } from "@/components/seo/PriceListBlock";
import { BudgetShelf } from "@/components/seo/BudgetShelf";
import { SeoFaqBlock } from "@/components/seo/SeoFaqBlock";
import {
  TopSellingProductCard,
  type TopSellingProductData,
} from "@/components/home/TopSellingProductCard";

export const revalidate = 3600;

const PATH = "/iphone-price-sri-lanka";

export async function generateMetadata(): Promise<Metadata> {
  const monthYear = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return buildPageMetadata({
    title: `iPhone Price in Sri Lanka — ${monthYear}`,
    description:
      "Current iPhone price in Sri Lanka at iCrowd — iPhone 17 Pro Max, iPhone 16 Pro Max, iPhone 17 and more with live LKR pricing. Genuine Apple, island-wide delivery, and an iPhone shop in Kandy.",
    path: PATH,
  });
}

function toTopSellingProduct(product: {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  imageUrl?: string;
  stock: number;
  warranty?: string | null;
}): TopSellingProductData {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    comparePrice: product.comparePrice,
    imageUrl: product.imageUrl,
    stock: product.stock,
    warranty: product.warranty,
  };
}

export default async function IphonePriceSriLankaPage() {
  const dbProducts = await queryStorefront("iphone-pillar-products", () =>
    getProductsByCategorySlug("phones", { limit: 100 }),
  ).catch(() => []);

  const reviewSummaries = await getReviewSummariesForProducts(dbProducts.map((p) => p.id)).catch(
    () => new Map<string, { rating: number; reviewCount: number }>(),
  );

  const brandById = new Map(
    dbProducts
      .map((p) => p.brand)
      .filter((b): b is NonNullable<typeof b> => Boolean(b))
      .map((b) => [b.id, b.name]),
  );

  const products = dbProducts.map((p) =>
    mapProductToCardData(p, { brandById, reviewStats: reviewSummaries.get(p.id) }),
  );

  const priceList = buildPriceListData(dbProducts);
  const budgetTiers = buildBudgetTiers(dbProducts.map((p) => Number(p.price)));
  const popular = [...products].sort((a, b) => a.price - b.price).slice(0, 8);

  const faqs = priceList
    ? [
        {
          question: "What is the iPhone price in Sri Lanka right now?",
          answer: `iPhone prices at iCrowd currently range from ${formatLkr(priceList.priceMin)} to ${formatLkr(priceList.priceMax)}, depending on the model and storage. See the live price list above or open any iPhone for its current price and stock.`,
        },
        {
          question: "Where can I buy an iPhone in Kandy?",
          answer:
            "iCrowd has a full shop in Kandy stocking genuine iPhones. Check the price list above for current stock, then visit for same-day pickup or order online for island-wide delivery.",
        },
        {
          question: "Do iCrowd iPhones come with a warranty?",
          answer:
            "Yes. Every iPhone we sell is genuine and comes with warranty coverage, listed on each product page along with storage options and current stock.",
        },
        {
          question: "Do you deliver iPhones island-wide in Sri Lanka?",
          answer:
            "Yes, we deliver iPhones to every district in Sri Lanka. You can also pick up in Kandy, or arrange pickup at our Kottawa or Matara points after ordering online.",
        },
      ]
    : [];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "iPhone Price in Sri Lanka — iCrowd",
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/products/${p.slug}`),
      name: p.name,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Phones", item: absoluteUrl("/categories/phones") },
      { "@type": "ListItem", position: 3, name: "iPhone Price in Sri Lanka", item: absoluteUrl(PATH) },
    ],
  };

  return (
    <div className="min-h-[60vh] bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      {faqs.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildFaqJsonLd(faqs)) }}
        />
      ) : null}

      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-5 lg:px-8">
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/categories/phones" className="hover:text-gray-700">
            Phones
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-medium text-gray-700">iPhone Price in Sri Lanka</span>
        </nav>

        <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
          iPhone Price in Sri Lanka
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600">
          Genuine Apple iPhones at iCrowd, with a full shop in Kandy and island-wide delivery
          across Sri Lanka. Below you'll find current iPhone prices, storage options, and
          answers to the questions we get asked most.
        </p>

        {priceList ? (
          <div className="mt-8">
            <PriceListBlock heading="iPhone Price List in Sri Lanka" priceList={priceList} />
          </div>
        ) : null}

        <BudgetShelf tiers={budgetTiers} basePath="/categories/phones" />

        {popular.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-3 text-lg font-bold text-black">Popular iPhones</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {popular.map((product) => (
                <TopSellingProductCard key={product.id} product={toTopSellingProduct(product)} />
              ))}
            </div>
          </section>
        ) : null}

        <div className="space-y-8">
          <section>
            <h2 className="mb-2 text-xl font-bold text-black">Choosing the right iPhone and storage</h2>
            <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
              iPhone prices in Sri Lanka scale mainly with storage and camera capability rather
              than the base chip — a 128GB base model and a 1TB Pro Max from the same generation
              can differ by well over LKR 100,000. If you mostly use streaming, messaging and
              social apps, 128GB is comfortable; if you shoot a lot of 4K video or keep a large
              photo library, 256GB or 512GB avoids running out of space within a year. Compare
              exact configurations and current stock on the price list above, or open any model
              for full specifications.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold text-black">Why buy your iPhone from iCrowd</h2>
            <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
              Every iPhone we sell is genuine, sourced through authorised channels, and backed by
              a manufacturer warranty listed on the product page. We keep our Sri Lanka pricing
              current and show live stock, so the price you see is the price you pay at checkout —
              no waiting for a quote. Payment is by card or bank deposit, and support is a
              WhatsApp message away if you need help choosing a model.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold text-black">iPhones in Kandy, and island-wide delivery</h2>
            <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
              If you're in or near Kandy, visit our full shop to see iPhones in person, compare
              colours and sizes, and take one home the same day when it's in stock. Everywhere
              else in Sri Lanka, order online and we deliver island-wide, with additional pickup
              points in Kottawa and Matara for customers who prefer to collect their order.{" "}
              <Link href="/locations/kandy" className="font-medium text-black underline hover:opacity-70">
                See the Kandy shop
              </Link>
              {" · "}
              <Link href="/locations" className="font-medium text-black underline hover:opacity-70">
                All locations
              </Link>
            </p>
          </section>
        </div>

        <div className="mt-10">
          <SeoFaqBlock faqs={faqs} />
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-[#F9F9F9] p-6">
          <h2 className="mb-3 text-lg font-bold text-black">Browse all iPhones</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/categories/phones"
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              All phones
            </Link>
            <Link
              href="/products/brands/apple"
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Apple brand page
            </Link>
            <Link
              href="/guides/iphone-17-price-sri-lanka-update"
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              iPhone 17 price update
            </Link>
            <Link
              href="/guides/buy-iphone-kandy"
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Buy iPhone in Kandy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
