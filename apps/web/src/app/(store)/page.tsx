import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  Star,
  Smartphone,
  BadgeCheck,
  Truck,
  CircleDollarSign,
  RefreshCw,
} from "lucide-react";
import { PhoneMockup } from "@/components/home/PhoneMockup";
import { DjiSpotlightCard } from "@/components/home/DjiSpotlightCard";
import { CategoryShowcaseCards } from "@/components/home/CategoryShowcaseCards";
import { NewArrivalsSection } from "@/components/home/NewArrivalsSection";
import { getProducts } from "@icrowed/database/queries";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CARD_GRADIENTS = [
  "from-indigo-500 to-blue-600",
  "from-gray-700 to-gray-900",
  "from-teal-500 to-emerald-600",
  "from-rose-500 to-red-600",
  "from-orange-500 to-amber-600",
  "from-violet-500 to-purple-600",
  "from-sky-500 to-cyan-600",
  "from-pink-500 to-rose-600",
];

function productGradient(id: string) {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return CARD_GRADIENTS[hash % CARD_GRADIENTS.length];
}

interface ProductImage { isPrimary: boolean; url: string }
interface WithBrand { brand?: { name: string } | null }

function mapFeatured(p: Awaited<ReturnType<typeof getProducts>>[number]) {
  const images = p.images as ProductImage[] | null | undefined;
  const brand  = (p as unknown as WithBrand).brand;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
    imageUrl: images?.find((i) => i.isPrimary)?.url ?? images?.[0]?.url,
    color: productGradient(p.id),
    badge: p.comparePrice ? "Sale" : undefined,
    brand: brand?.name ?? undefined,
    shortDescription: p.shortDescription ?? undefined,
  };
}

const OFFERS = [
  { id: "1", title: "Mid-Year Mega Sale", desc: "Up to 40% off smartphones", badge: "Limited", gradient: "from-purple-600 to-indigo-600", link: "/offers" },
  { id: "2", title: "Bundle & Save", desc: "Phone + Case + Screen protector – save LKR 5,000", badge: "Bundle", gradient: "from-rose-500 to-orange-500", link: "/offers" },
  { id: "3", title: "Free Delivery", desc: "Free island-wide delivery this weekend", badge: "Weekend", gradient: "from-teal-500 to-cyan-500", link: "/offers" },
];

function formatPrice(p: number) {
  return "LKR " + p.toLocaleString("en-LK");
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const dbFeatured = await getProducts({ isFeatured: true, limit: 6 }).catch(() => []);
  const dbNewArrivals = await getProducts({ limit: 4 }).catch(() => []);
  const FEATURED_PRODUCTS = dbFeatured.length
    ? dbFeatured.map(mapFeatured)
    : [] as ReturnType<typeof mapFeatured>[];
  const NEW_ARRIVALS = dbNewArrivals.length
    ? dbNewArrivals.map(mapFeatured)
    : [] as ReturnType<typeof mapFeatured>[];

  return (
    <div className="bento-bg">
      {/* ═══════════════════════════════ BENTO HERO ══════════════════════════ */}
      <section className="px-3 sm:px-5 lg:px-8 pt-5 pb-4 max-w-350 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 lg:gap-4">

          {/* ── 1. MAIN HERO CARD ─────────────────────────────── lg:col-span-4 */}
          <div className="bento-card lg:col-span-4 relative min-h-100 lg:min-h-115 p-6 sm:p-8 flex flex-col justify-between overflow-hidden border border-white/55 bg-white/45 backdrop-blur-xl shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/65 via-white/35 to-gray-100/25" />
            <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-white/60 blur-3xl" />
            {/* Top area */}
            <div className="relative">
              {/* Badge row */}
              <div className="flex items-center gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-semibold px-3 py-1 rounded-full border border-indigo-100">
                  <span>📱</span> Sri Lanka&apos;s #1 Phone Store
                </span>
              </div>

              {/* Slide counter */}
              <p className="text-4xl font-black text-gray-200 leading-none mb-2 select-none">01</p>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.08] mb-3 max-w-sm">
                Premium Phones.<br />
                <span className="text-indigo-600">Best Prices</span> in<br />
                Sri Lanka.
              </h1>

              {/* Sub */}
              <p className="text-gray-500 text-sm leading-relaxed max-w-65 mb-7">
                Genuine products, island-wide delivery, and unbeatable prices on the latest smartphones.
              </p>

              {/* CTA */}
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-lime-400 hover:bg-lime-500 active:bg-lime-600 text-gray-900 font-bold px-6 py-3 rounded-full text-sm transition-all duration-200 shadow-lg shadow-lime-200 hover:shadow-lime-300 hover:-translate-y-0.5"
              >
                View All Products
                <span className="w-6 h-6 bg-gray-900/10 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>

            {/* Social links */}
            <div className="relative flex items-center gap-3 mt-6">
              <span className="text-[11px] text-gray-400 font-medium">Follow us:</span>
              {[
                { label: "FB", href: "#" },
                { label: "TW", href: "#" },
                { label: "IG", href: "#" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 flex items-center justify-center text-[10px] font-bold text-gray-500 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>

            {/* Floating phone — absolutely positioned, hidden on smallest screens */}
            <div className="hidden sm:block absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 animate-float pointer-events-none">
              <PhoneMockup gradient="from-indigo-400 via-purple-500 to-pink-400" />
            </div>
          </div>

          {/* ── 2. DJI SPOTLIGHT ─────────────────────────────── lg:col-span-2 */}
          <DjiSpotlightCard />

        </div>
      </section>

      <CategoryShowcaseCards />

      <NewArrivalsSection
        items={NEW_ARRIVALS.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          price: item.price,
          imageUrl: item.imageUrl,
          brand: item.brand,
        }))}
      />

      {/* ═══════════════════════════ FEATURED PRODUCTS ══════════════════════ */}
      <section className="px-3 sm:px-5 lg:px-8 py-4 max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">Featured Phones</h2>
            <p className="text-gray-400 text-xs mt-0.5">Handpicked top sellers</p>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {FEATURED_PRODUCTS.length === 0 && (
            <p className="col-span-full text-center text-sm text-gray-400 py-8">No featured products yet. Add some in the admin panel.</p>
          )}
          {FEATURED_PRODUCTS.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="bento-card p-4 flex flex-col group"
            >
              {/* Product image area */}
              <div className={`relative rounded-2xl bg-gradient-to-br ${p.color} aspect-square mb-3 flex items-center justify-center overflow-hidden`}>
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 16vw" />
                ) : (
                  <Smartphone className="w-10 h-10 text-white/70 group-hover:scale-110 transition-transform duration-300" />
                )}
                {p.badge && (
                  <span className="absolute top-2 left-2 bg-white/90 text-gray-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {p.badge}
                  </span>
                )}
              </div>

              {/* Info */}
              <p className="text-[11px] text-gray-400 mb-0.5 truncate">{p.brand ?? ""}</p>
              <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2 mb-1">{p.name}</p>

              {/* Price */}
              <div className="mt-auto">
                <p className="text-xs font-black text-gray-900">{formatPrice(p.price)}</p>
                {p.comparePrice && (
                  <p className="text-[10px] text-gray-400 line-through">{formatPrice(p.comparePrice)}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════ HOT OFFERS ═════════════════════════ */}
      <section className="px-3 sm:px-5 lg:px-8 py-4 max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Hot Offers</h2>
          <Link href="/offers" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            All offers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {OFFERS.map((offer) => (
            <Link
              key={offer.id}
              href={offer.link}
              className={`relative rounded-3xl bg-gradient-to-br ${offer.gradient} text-white p-6 group hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden`}
            >
              {/* Blur blob */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              <span className="relative inline-block border border-white/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-3">
                {offer.badge}
              </span>
              <h3 className="relative font-black text-lg leading-snug mb-1">{offer.title}</h3>
              <p className="relative text-xs text-white/75 leading-relaxed">{offer.desc}</p>
              <ArrowUpRight className="absolute bottom-5 right-5 w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════ WHY ICROWED ═════════════════════════ */}
      <section className="px-3 sm:px-5 lg:px-8 py-4 pb-8 max-w-[1400px] mx-auto">
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
            {[
              { Icon: BadgeCheck,          label: "100% Genuine",  desc: "Official warranty on all products", bg: "bg-emerald-50",  iconColor: "#065f46", labelColor: "text-emerald-900", descColor: "text-emerald-700" },
              { Icon: Truck,              label: "Fast Delivery",  desc: "Same-day Colombo · 1-3 days island", bg: "bg-blue-50",    iconColor: "#1e3a8a", labelColor: "text-blue-900",    descColor: "text-blue-700" },
              { Icon: CircleDollarSign,   label: "Best Prices",    desc: "Price-matched vs all retailers",     bg: "bg-amber-50",   iconColor: "#78350f", labelColor: "text-amber-900",  descColor: "text-amber-700" },
              { Icon: RefreshCw,          label: "Easy Returns",   desc: "7-day no-questions returns",         bg: "bg-rose-50",    iconColor: "#881337", labelColor: "text-rose-900",   descColor: "text-rose-700" },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} py-10 px-6 flex flex-col items-center text-center gap-3`}>
                <div className="w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center">
                  <item.Icon size={30} color={item.iconColor} />
                </div>
                <p className={`text-base font-extrabold ${item.labelColor}`}>{item.label}</p>
                <p className={`text-sm font-medium leading-relaxed ${item.descColor}`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
