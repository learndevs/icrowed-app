import {
  BadgeCheck,
  Truck,
  CircleDollarSign,
  RefreshCw,
  Sparkles,
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
      <section className="px-3 sm:px-5 lg:px-8 py-4 pb-10 max-w-[1400px] mx-auto">
        {/* Section heading */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">Why iCrowed?</h2>
            <p className="text-xs text-gray-400">Every order, every time</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              Icon: BadgeCheck,
              label: "100% Genuine",
              desc: "Official warranty on all products",
              iconGradient: "from-emerald-400 to-teal-500",
              iconShadow: "shadow-emerald-200",
              accent: "group-hover:text-emerald-600",
              pill: "bg-emerald-50 text-emerald-700 border-emerald-100",
            },
            {
              Icon: Truck,
              label: "Fast Delivery",
              desc: "Same-day Colombo · 1–3 days island-wide",
              iconGradient: "from-blue-400 to-indigo-500",
              iconShadow: "shadow-blue-200",
              accent: "group-hover:text-blue-600",
              pill: "bg-blue-50 text-blue-700 border-blue-100",
            },
            {
              Icon: CircleDollarSign,
              label: "Best Prices",
              desc: "Price-matched vs all retailers",
              iconGradient: "from-amber-400 to-orange-500",
              iconShadow: "shadow-amber-200",
              accent: "group-hover:text-amber-600",
              pill: "bg-amber-50 text-amber-700 border-amber-100",
            },
            {
              Icon: RefreshCw,
              label: "Easy Returns",
              desc: "7-day no-questions returns",
              iconGradient: "from-rose-400 to-pink-500",
              iconShadow: "shadow-rose-200",
              accent: "group-hover:text-rose-600",
              pill: "bg-rose-50 text-rose-700 border-rose-100",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bento-card group p-6 flex flex-col items-center text-center gap-4"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.iconGradient} flex items-center justify-center shadow-lg ${item.iconShadow} transition-transform duration-300 group-hover:scale-110`}
              >
                <item.Icon className="w-7 h-7 text-white" />
              </div>

              <div className="space-y-1.5">
                <p className={`text-base font-black text-gray-900 transition-colors duration-200 ${item.accent}`}>
                  {item.label}
                </p>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>

              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${item.pill}`}>
                Guaranteed
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
