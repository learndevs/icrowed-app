import Image from "next/image";
import Link from "next/link";

const CATEGORY_SHOWCASE_CARDS = [
  {
    name: "MOBILE PHONES",
    href: "/products?category=smartphones",
    image: "/home/categories/smartphones.png",
    count: "200+ items",
    description: "Latest phones, flagship models, and budget picks.",
  },
  {
    name: "EARBUDS",
    href: "/products?category=earbuds",
    image: "/home/categories/earbuds.png",
    count: "60+ items",
    description: "Wireless earbuds, headsets, and audio essentials.",
  },
  {
    name: "CHARGERS",
    href: "/products?category=chargers",
    image: "/home/categories/chargers.png",
    count: "80+ items",
    description: "Fast chargers, adapters, and charging solutions.",
  },
  {
    name: "SMART WATCHES",
    href: "/products?category=smartwatches",
    image: "/home/categories/smartwatch.png",
    count: "30+ items",
    description: "Fitness watches and smart wearable accessories.",
  },
  {
    name: "CHARGING ADAPTERS",
    href: "/products?category=cables",
    image: "/home/categories/cables.png",
    count: "120+ items",
    description: "USB, Type-C, and reliable everyday connectors.",
  },
] as const;

export function CategoryShowcaseCards() {
  return (
    <section className="px-3 sm:px-5 lg:px-8 py-5 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
        {CATEGORY_SHOWCASE_CARDS.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="group relative overflow-hidden rounded-2xl sm:rounded-[1.5rem] border border-white/70 bg-white/55 backdrop-blur-xl shadow-[0_10px_26px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.16)]"
          >
            <div className="relative flex flex-col h-full p-3 sm:p-4 items-center">
              <div className="relative flex-1 min-h-[12rem] sm:min-h-[14rem] lg:min-h-[16rem] w-full shrink-0 overflow-hidden rounded-xl sm:rounded-2xl bg-gray-100/80 backdrop-blur-md">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  unoptimized
                  className="object-contain object-top p-2 sm:p-3 transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1280px) 45vw, 30vw"
                />
              </div>

              <div className="min-w-0 w-full px-1 pt-1 pb-1 flex items-center justify-center">
                <p className="text-sm sm:text-base font-black text-gray-900 line-clamp-2 text-center">
                  {cat.name}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
