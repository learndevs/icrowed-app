import {
  BadgeCheck,
  Truck,
  CircleDollarSign,
  RefreshCw,
} from "lucide-react";
import { HomeHero } from "@/components/home/HomeHero";
import { CategoryShowcaseCards } from "@/components/home/CategoryShowcaseCards";
import { AppleProductsSection } from "@/components/home/AppleProductsSection";
import { HomeOffersSection } from "@/components/home/HomeOffersSection";

/** Load Apple strip + offers from DB on every request (avoid empty build-time cache). */
export const dynamic = "force-dynamic";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  return (
    <div className="bento-bg">
      <HomeHero />

      <CategoryShowcaseCards />

      <AppleProductsSection />

      <HomeOffersSection />

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
