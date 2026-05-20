import Image from "next/image";
import Link from "next/link";

const HERO_HEIGHT =
  "h-[480px] sm:h-[520px] lg:h-[560px]";

/* Shared CTA row */
function HeroButtons({
  contactHref,
  buyHref,
  buyVariant = "outline",
}: {
  contactHref: string;
  buyHref: string;
  buyVariant?: "outline" | "outline-light";
}) {
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <Link
        href={contactHref}
        className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors active:scale-[0.97]"
      >
        Contact us
      </Link>
      <Link
        href={buyHref}
        className={`inline-flex items-center justify-center rounded-full border-2 px-8 py-3 text-sm font-semibold transition-colors active:scale-[0.97] ${
          buyVariant === "outline-light"
            ? "border-zinc-800/60 bg-white/30 backdrop-blur-sm text-zinc-900 hover:bg-zinc-900 hover:text-white"
            : "border-zinc-800 bg-transparent text-zinc-900 hover:bg-zinc-900 hover:text-white"
        }`}
      >
        Buy
      </Link>
    </div>
  );
}

/** ─── Phone slide ──────────────────────────────────────────────────────────── */
function PhoneHero() {
  return (
    <div
      className={`relative overflow-hidden bg-white flex flex-col items-center sm:rounded-[2rem] sm:shadow-[0_8px_32px_rgba(0,0,0,0.08)] ${HERO_HEIGHT}`}
    >
      {/* Text */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-10 sm:pt-12">
        <h2 className="text-[2rem] sm:text-[2.4rem] font-black text-zinc-900 leading-tight tracking-tight">
          Phone
        </h2>
        <p className="mt-2 text-sm sm:text-base text-zinc-500 leading-relaxed whitespace-nowrap">
          Premium Phones. Best Prices in Sri Lanka
        </p>
        <HeroButtons contactHref="/contact" buyHref="/products?category=phones" />
      </div>

      {/* iPhone image at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[60%]">
        <Image
          src="/home/hero/phone.png"
          alt="Premium smartphones"
          fill
          className="object-contain object-bottom"
          priority
        />
      </div>
    </div>
  );
}

/** ─── Drone slide ──────────────────────────────────────────────────────────── */
function DroneHero() {
  return (
    <div
      className={`relative overflow-hidden sm:rounded-[2rem] sm:shadow-[0_8px_32px_rgba(0,0,0,0.10)] ${HERO_HEIGHT}`}
    >
      {/* Full-bleed background */}
      <Image
        src="/home/hero/drone.png"
        alt="DJI Drone"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Light gradient at top for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100/75 via-sky-50/30 to-transparent pointer-events-none" />

      {/* Text */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-10 sm:pt-12">
        {/* DJI logo + heading */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="relative h-7 w-16 sm:h-8 sm:w-20 shrink-0">
            <Image
              src="/home/hero/dji-logo.png"
              alt="DJI"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-[2rem] sm:text-[2.4rem] font-black text-zinc-900 leading-tight tracking-tight">
            Drone
          </h2>
        </div>
        <p className="mt-2 text-sm sm:text-base text-zinc-700 leading-relaxed max-w-[260px]">
          Best place to buy drone products
        </p>
        <HeroButtons
          contactHref="/contact"
          buyHref="/products?category=drones"
          buyVariant="outline-light"
        />
      </div>
    </div>
  );
}

/** ─── Exported hero wrapper ────────────────────────────────────────────────── */
export function HomeHero() {
  return (
    <section className="sm:px-5 sm:pt-5 sm:pb-4 lg:px-8 max-w-[1400px] lg:mx-auto flex flex-col gap-0 sm:gap-4">
      <PhoneHero />
      <DroneHero />
    </section>
  );
}
