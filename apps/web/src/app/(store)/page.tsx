import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  Star,
  TrendingUp,
  Smartphone,
  Shield,
  Zap,
  Headphones,
  Cable,
  Watch,
  BadgeCheck,
  Truck,
  CircleDollarSign,
  RefreshCw,
} from "lucide-react";
import { PhoneMockup } from "@/components/home/PhoneMockup";
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

const PHONE_COLORS = [
  { label: "Midnight", color: "#1a1a2e" },
  { label: "Silver", color: "#c0c0c0" },
  { label: "Gold", color: "#d4a843" },
  { label: "Rose", color: "#e8849a" },
  { label: "Blue", color: "#4a90d9" },
];

const CATEGORIES = [
  { name: "Smartphones", Icon: Smartphone,  href: "/products?category=smartphones", count: "200+", circle: "bg-sky-400",    text: "text-sky-600",    cardBg: "bg-sky-50",    border: "border-sky-200" },
  { name: "Cases",       Icon: Shield,      href: "/products?category=cases",       count: "500+", circle: "bg-teal-400",   text: "text-teal-600",   cardBg: "bg-teal-50",   border: "border-teal-200" },
  { name: "Chargers",   Icon: Zap,         href: "/products?category=chargers",    count: "80+",  circle: "bg-orange-400", text: "text-orange-600", cardBg: "bg-orange-50", border: "border-orange-200" },
  { name: "Earbuds",    Icon: Headphones,  href: "/products?category=earbuds",     count: "60+",  circle: "bg-pink-400",   text: "text-pink-600",   cardBg: "bg-pink-50",   border: "border-pink-200" },
  { name: "Cables",     Icon: Cable,       href: "/products?category=cables",      count: "120+", circle: "bg-violet-500", text: "text-violet-600", cardBg: "bg-violet-50", border: "border-violet-200" },
  { name: "Smartwatch", Icon: Watch,       href: "/products?category=smartwatches",count: "30+",  circle: "bg-amber-400",  text: "text-amber-600",  cardBg: "bg-amber-50",  border: "border-amber-200" },
];

function formatPrice(p: number) {
  return "LKR " + p.toLocaleString("en-LK");
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const dbFeatured = await getProducts({ isFeatured: true, limit: 6 }).catch(() => []);
  const FEATURED_PRODUCTS = dbFeatured.length
    ? dbFeatured.map(mapFeatured)
    : [] as ReturnType<typeof mapFeatured>[];

  const newArrival = FEATURED_PRODUCTS[0];
  const popularPick = FEATURED_PRODUCTS[1] ?? FEATURED_PRODUCTS[0];

  return (
    <div className="bento-bg">
      {/* ═══════════════════════════════ BENTO HERO ══════════════════════════ */}
      <section className="px-3 sm:px-5 lg:px-8 pt-5 pb-4 max-w-350 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 lg:gap-4">

          {/* ── 1. MAIN HERO CARD ─────────────────────────────── lg:col-span-4 */}
          <div className="bento-card lg:col-span-4 relative min-h-100 lg:min-h-115 p-6 sm:p-8 flex flex-col justify-between overflow-visible">
            {/* Top area */}
            <div>
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
            <div className="flex items-center gap-3 mt-6">
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

          {/* ── 2. POPULAR COLORS CARD ──────────────────────── lg:col-span-2 */}
          <div className="bento-card lg:col-span-2 p-5 sm:p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Popular Colors</p>
            <div className="flex items-center gap-3 flex-wrap mb-5">
              {PHONE_COLORS.map((c) => (
                <button
                  key={c.label}
                  title={c.label}
                  className="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform duration-150 cursor-pointer"
                  style={{ background: c.color, boxShadow: `0 2px 8px ${c.color}60` }}
                />
              ))}
            </div>
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center" style={{ minHeight: 120 }}>
              <div className="animate-float-slow">
                <PhoneMockup gradient="from-gray-600 to-gray-900" />
              </div>
            </div>
          </div>

          {/* ── 3. NEW ARRIVAL CARD ──────────────────────────── lg:col-span-2 */}
          <div className="bento-card lg:col-span-2 p-5 sm:p-6 flex flex-col justify-between">
            {newArrival ? (
              <>
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 px-2.5 py-1 rounded-full">New Arrival</span>
                  <div className={`mt-3 w-full rounded-2xl aspect-video bg-gradient-to-br ${newArrival.color} flex items-center justify-center overflow-hidden`}>
                    {newArrival.imageUrl ? (
                      <Image src={newArrival.imageUrl} alt={newArrival.name} width={200} height={200} className="object-contain max-h-28" />
                    ) : (
                      <Smartphone className="w-10 h-10 text-white/70" />
                    )}
                  </div>
                  <h3 className="mt-3 font-black text-gray-900 text-lg leading-snug line-clamp-2">{newArrival.name}{newArrival.brand && <><br /><span className="text-gray-400 font-medium text-base">{newArrival.brand}</span></>}</h3>
                  {newArrival.shortDescription && <p className="text-gray-500 text-xs mt-1.5 leading-relaxed line-clamp-2">{newArrival.shortDescription}</p>}
                  <p className="mt-2 font-black text-gray-900 text-xl">{formatPrice(newArrival.price)}</p>
                </div>
                <Link href={`/products/${newArrival.slug}`} className="mt-4 self-end w-9 h-9 bg-gray-900 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </Link>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">No featured products</div>
            )}
          </div>

          {/* ── 4. MORE PRODUCTS CARD ────────────────────────── lg:col-span-2 */}
          <div className="bento-card lg:col-span-2 p-5 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-bold text-gray-900 text-base">More Products</p>
                <p className="text-gray-400 text-xs mt-0.5">{FEATURED_PRODUCTS.length}+ items featured</p>
              </div>
              <Link href="/products" className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors">
                <Star className="w-4 h-4 text-red-500 fill-red-500" />
              </Link>
            </div>
            {/* Mini product grid */}
            <div className="grid grid-cols-3 gap-2">
              {FEATURED_PRODUCTS.slice(0, 6).map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`}
                  className={`aspect-square rounded-xl bg-gradient-to-br ${p.color} hover:scale-105 transition-transform duration-150 flex items-center justify-center shadow-sm overflow-hidden`}
                >
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.name} width={80} height={80} className="object-contain" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-white/80" />
                  )}
                </Link>
              ))}
              {FEATURED_PRODUCTS.length === 0 && (
                <p className="col-span-3 text-xs text-gray-400 text-center py-4">No products yet</p>
              )}
            </div>
          </div>

          {/* ── 5. STATS CARD ────────────────────────────────── lg:col-span-2 */}
          <div className="bento-card lg:col-span-2 p-5 sm:p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
            {/* Avatar stack */}
            <div className="flex items-center mb-4">
              {["#6366f1","#818cf8","#a5b4fc","#c7d2fe"].map((bg, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-indigo-600 flex items-center justify-center text-xs font-bold"
                  style={{ background: bg, marginLeft: i ? -8 : 0 }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-4xl font-black mb-0.5">10k+</p>
            <p className="text-indigo-200 text-sm font-medium">Happy Customers</p>
            <div className="mt-4 flex items-center gap-1.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-indigo-200 text-xs ml-1">4.8 avg rating</span>
            </div>
            <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
              <TrendingUp className="w-4 h-4 text-lime-300" />
              <span className="text-xs text-indigo-100 font-medium">+34% growth this month</span>
            </div>
          </div>

          {/* ── 6. POPULAR PRODUCT CARD ──────────────────────── lg:col-span-2 */}
          <div className="bento-card lg:col-span-2 p-5 sm:p-6 flex flex-col justify-between">
            {popularPick ? (
              <>
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-rose-600 uppercase bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                    ❤️ Popular
                  </span>
                  <div className={`mt-3 flex justify-center py-2 animate-float-slow`}>
                    <div className={`w-20 h-20 rounded-[1.5rem] bg-gradient-to-br ${popularPick.color} flex items-center justify-center shadow-lg overflow-hidden`}>
                      {popularPick.imageUrl ? (
                        <Image src={popularPick.imageUrl} alt={popularPick.name} width={80} height={80} className="object-contain" />
                      ) : (
                        <Smartphone className="w-9 h-9 text-white/80" />
                      )}
                    </div>
                  </div>
                  <h3 className="font-black text-gray-900 text-base mt-3 line-clamp-2">{popularPick.name}</h3>
                  {popularPick.brand && <p className="text-gray-400 text-xs mt-0.5">{popularPick.brand}</p>}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-black text-gray-900">{formatPrice(popularPick.price)}</span>
                  <Link href={`/products/${popularPick.slug}`} className="text-xs font-semibold text-indigo-600 hover:underline">View →</Link>
                </div>
              </>
            ) : null}
          </div>

        </div>
      </section>

      {/* ════════════════════════════ CATEGORIES ROW ════════════════════════ */}
      <section className="px-3 sm:px-5 lg:px-8 py-4 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className={`${cat.cardBg} ${cat.border} border aspect-square rounded-3xl flex flex-col items-center justify-center text-center gap-2.5 p-3 hover:shadow-md hover:brightness-95 group transition-all duration-200`}
            >
              <div className={`${cat.circle} w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                <cat.Icon size={24} color="white" />
              </div>
              <p className={`text-[11px] sm:text-xs font-bold ${cat.text} leading-tight`}>{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

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
