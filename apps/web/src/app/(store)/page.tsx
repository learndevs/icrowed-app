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
      <section className="py-4 pb-10">
        {/* Mobile: snap carousel | Desktop: 4-col grid */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-3 sm:px-5 pb-3 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-8 lg:pb-0 max-w-[1400px] lg:mx-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { Icon: BadgeCheck,        label: "100% Genuine",  desc: "Official warranty on all products"       },
            { Icon: Truck,             label: "Fast Delivery",  desc: "Same-day Colombo · 1–3 days island-wide" },
            { Icon: CircleDollarSign,  label: "Best Prices",    desc: "Price-matched vs all retailers"          },
            { Icon: RefreshCw,         label: "Easy Returns",   desc: "7-day no-questions returns"              },
          ].map((item) => (
            <div
              key={item.label}
              className="bento-card snap-start shrink-0 w-[72vw] sm:w-[44vw] lg:w-auto p-6 flex flex-col items-center text-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <item.Icon className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="text-sm font-bold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
