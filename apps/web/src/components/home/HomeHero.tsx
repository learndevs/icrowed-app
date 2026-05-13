import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Storefront hero — modern glass, ambient gradients, grid texture,
 * staggered entrance (CSS), elevated CTAs.
 */
export function HomeHero() {
  return (
    <section className="px-3 sm:px-5 lg:px-8 pt-5 pb-4 max-w-[1400px] mx-auto">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/65 shadow-[0_28px_80px_-20px_rgba(15,23,42,0.14)] backdrop-blur-xl backdrop-saturate-150">
        {/* Ambient orbs */}
        <div
          className="pointer-events-none absolute -right-28 -top-36 h-[22rem] w-[22rem] rounded-full bg-gradient-to-bl from-violet-400/35 via-indigo-400/20 to-transparent blur-3xl animate-float-slow"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-36 -left-20 h-[20rem] w-[20rem] rounded-full bg-gradient-to-tr from-sky-300/25 via-indigo-200/15 to-transparent blur-3xl animate-float-slow [animation-delay:-3.5s]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[min(90%,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-indigo-500/[0.07] via-violet-500/[0.05] to-cyan-500/[0.07] blur-2xl"
          aria-hidden
        />

        {/* Fine grid + vignette */}
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(24_24_27/0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgb(24_24_27/0.045)_1px,transparent_1px)] bg-[size:56px_56px] mask-[radial-gradient(ellipse_75%_65%_at_50%_45%,black,transparent)] opacity-90"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-zinc-100/30"
          aria-hidden
        />

        {/* Top sheen */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90"
          aria-hidden
        />

        <div className="relative px-6 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p
              className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500 opacity-0 animate-slide-up [animation-delay:80ms] [animation-fill-mode:forwards]"
            >
              Sri Lanka · iCrowed
            </p>

            <h1 className="opacity-0 animate-slide-up [animation-delay:160ms] [animation-fill-mode:forwards] text-[2rem] font-semibold leading-[1.1] tracking-[-0.035em] text-zinc-950 sm:text-4xl lg:text-[2.85rem]">
              Premium phones.
              <span className="mt-2 block bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent sm:mt-3">
                Best prices, genuine stock.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-zinc-600 opacity-0 animate-slide-up [animation-delay:240ms] [animation-fill-mode:forwards] sm:text-base">
              Island-wide delivery, clear warranties, and the models you actually want — without the noise.
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 opacity-0 animate-slide-up [animation-delay:320ms] [animation-fill-mode:forwards] sm:flex-row sm:items-center">
              <Link
                href="/products"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-zinc-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/25 transition duration-300 hover:shadow-xl hover:shadow-indigo-500/15 active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-500/25 to-violet-600/0 opacity-0 transition duration-500 group-hover:opacity-100" />
                <span className="relative">Shop all products</span>
                <ArrowUpRight
                  className="relative h-4 w-4 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2}
                />
              </Link>
              <Link
                href="/products/brands/apple"
                className="inline-flex items-center justify-center rounded-full border border-zinc-200/90 bg-white/50 px-7 py-3.5 text-sm font-medium text-zinc-800 shadow-sm backdrop-blur-sm transition duration-300 hover:border-indigo-200/80 hover:bg-white/90 hover:shadow-md hover:shadow-indigo-500/5 active:scale-[0.98]"
              >
                Browse Apple
              </Link>
            </div>

            {/* Accent pulse line */}
            <div
              className="mx-auto mt-12 h-1 w-16 rounded-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 animate-fade-in [animation-delay:480ms] [animation-fill-mode:forwards]"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
}
