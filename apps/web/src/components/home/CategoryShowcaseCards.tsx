import Image from "next/image";
import Link from "next/link";

const CATEGORY_SHOWCASE_CARDS = [
  {
    name: "Smartphones",
    href: "/products?category=smartphones",
    image: "/home/categories/smartphones.png",
    count: "200+ items",
    accentClass: "from-orange-400/30 to-amber-300/10",
  },
  {
    name: "Cases & Covers",
    href: "/products?category=cases",
    image: "/home/categories/cases.png",
    count: "500+ items",
    accentClass: "from-pink-400/30 to-rose-300/10",
  },
  {
    name: "Earbuds & Audio",
    href: "/products?category=earbuds",
    image: "/home/categories/earbuds.png",
    count: "60+ items",
    accentClass: "from-rose-400/30 to-red-300/10",
  },
  {
    name: "Chargers",
    href: "/products?category=chargers",
    image: "/home/categories/chargers.png",
    count: "80+ items",
    accentClass: "from-slate-500/30 to-gray-400/10",
  },
  {
    name: "Smart Watches",
    href: "/products?category=smartwatches",
    image: "/home/categories/smartwatch.png",
    count: "30+ items",
    accentClass: "from-orange-500/30 to-yellow-400/10",
  },
  {
    name: "Cables & Adapters",
    href: "/products?category=cables",
    image: "/home/categories/cables.png",
    count: "120+ items",
    accentClass: "from-zinc-500/30 to-slate-300/10",
  },
] as const;

export function CategoryShowcaseCards() {
  return (
    <section className="px-3 sm:px-5 lg:px-8 py-5 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {CATEGORY_SHOWCASE_CARDS.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="group relative overflow-hidden rounded-[1.5rem] border border-white/40 bg-white/35 p-4 sm:p-5 backdrop-blur-xl shadow-[0_12px_30px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.16)]"
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${cat.accentClass}`} />
            <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-white/45 blur-3xl" />

            <div className="relative flex items-center gap-4">
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-2xl border border-white/50 bg-white/65 backdrop-blur-md">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 96px, 112px"
                />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-black text-gray-900">{cat.name}</p>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mt-1">{cat.count}</p>
                <span className="inline-flex mt-3 rounded-full border border-white/60 bg-white/55 px-3 py-1 text-[11px] sm:text-xs font-semibold text-gray-700 backdrop-blur-md">
                  Explore category
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
