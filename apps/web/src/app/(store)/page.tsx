import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  BadgeCheck,
  Truck,
  CircleDollarSign,
  RefreshCw,
} from "lucide-react";
import { HomeHero } from "@/components/home/HomeHero";
import { CategoryShowcaseCards } from "@/components/home/CategoryShowcaseCards";
import { AppleProductsSection } from "@/components/home/AppleProductsSection";

/** Load Apple strip from DB on every request (avoid empty build-time cache). */
export const dynamic = "force-dynamic";

const OFFERS = [
  { id: "1", title: "Mid-Year Mega Sale", desc: "Up to 40% off smartphones", badge: "Limited", gradient: "from-purple-600 to-indigo-600", link: "/offers" },
  { id: "2", title: "Bundle & Save", desc: "Phone + Case + Screen protector – save LKR 5,000", badge: "Bundle", gradient: "from-rose-500 to-orange-500", link: "/offers" },
  { id: "3", title: "Free Delivery", desc: "Free island-wide delivery this weekend", badge: "Weekend", gradient: "from-teal-500 to-cyan-500", link: "/offers" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  return (
    <div className="bento-bg">
      <HomeHero />

      <CategoryShowcaseCards />

      <AppleProductsSection />

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
