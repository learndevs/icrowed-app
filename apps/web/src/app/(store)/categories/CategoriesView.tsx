"use client";

import Link from "next/link";
import {
  ChevronRight,
  Headphones,
  Layers,
  Mic2,
  Radio,
  Sparkles,
  Usb,
  Zap,
} from "lucide-react";

export type CategoryCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export type BrandCard = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

const GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-sky-500 to-cyan-600",
  "from-rose-500 to-orange-500",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-rose-600",
  "from-fuchsia-500 to-purple-600",
  "from-blue-600 to-indigo-700",
  "from-slate-600 to-slate-900",
] as const;

function gradientFor(id: string) {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[n % GRADIENTS.length];
}

function categoryIcon(slug: string) {
  const s = slug.toLowerCase();
  if (s.includes("drone")) return Zap;
  if (s.includes("mic") || s.includes("audio")) return Mic2;
  if (s.includes("radio") || s.includes("device")) return Radio;
  if (s.includes("power") || s.includes("bank") || s.includes("charg")) return Usb;
  if (s.includes("ear") || s.includes("bud") || s.includes("headphone")) return Headphones;
  return Layers;
}

function productsHrefForCategory(name: string) {
  return `/products?category=${encodeURIComponent(name)}`;
}

function productsHrefForBrand(name: string) {
  return `/products?brand=${encodeURIComponent(name)}`;
}

export function CategoriesView({
  categories,
  brands,
}: {
  categories: CategoryCard[];
  brands: BrandCard[];
}) {
  return (
    <div className="bento-bg min-h-screen">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5 lg:px-8 py-6 sm:py-10 space-y-12 sm:space-y-16">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] border border-black/[0.06] bg-gradient-to-br from-gray-900 via-indigo-950 to-violet-900 text-white shadow-xl animate-fade-in">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div className="max-w-2xl space-y-4">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-indigo-100 ring-1 ring-white/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  Shop the collection
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                  Categories &amp; brands
                  <span className="block text-indigo-200/90 text-2xl sm:text-3xl lg:text-4xl mt-1 font-extrabold">
                    built for how you browse.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-gray-300/95 leading-relaxed max-w-xl">
                  Explore drones, mics, audio gear, power banks, earbuds, and more — everything you see
                  here is managed from the admin panel (categories &amp; brands), so your storefront stays
                  in sync with your catalog.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="#shop-by-category"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-gray-900 shadow-lg shadow-black/20 transition hover:bg-indigo-50"
                  >
                    Browse categories
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="#shop-by-brand"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/5 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
                  >
                    Shop by brand
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-indigo-100 underline-offset-4 hover:underline"
                  >
                    View all products
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md lg:max-w-xs shrink-0">
                {[
                  { label: "Categories", value: categories.length },
                  { label: "Brands", value: brands.length },
                  { label: "Curated", value: "Admin" },
                  { label: "Style", value: "Bento" },
                ].map((tile) => (
                  <div
                    key={tile.label}
                    className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-md"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200/80">
                      {tile.label}
                    </p>
                    <p className="mt-1 text-2xl font-black">{tile.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section id="shop-by-category" className="scroll-mt-24 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Shop by category</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-xl">
                Add or reorder categories in the admin console — they appear here automatically.
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
            >
              All products <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {categories.length === 0 ? (
            <div className="bento-card p-10 text-center text-gray-500 text-sm">
              No categories yet. Create them under{" "}
              <span className="font-semibold text-gray-800">Admin → Categories</span>.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {categories.map((cat, i) => {
                const Icon = categoryIcon(cat.slug);
                const g = gradientFor(cat.id);
                return (
                  <Link
                    key={cat.id}
                    href={productsHrefForCategory(cat.name)}
                    className="group bento-card flex flex-col overflow-hidden text-left animate-slide-up"
                    style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                  >
                    <div className={`relative h-40 sm:h-44 bg-gradient-to-br ${g} overflow-hidden`}>
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon className="w-14 h-14 text-white/90 drop-shadow-lg" strokeWidth={1.25} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                        <span className="text-lg font-black text-white drop-shadow-md line-clamp-2">
                          {cat.name}
                        </span>
                        <span className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/30 transition group-hover:bg-white group-hover:text-gray-900">
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 flex-1 flex flex-col">
                      <p className="text-xs font-mono text-gray-400 mb-1">/{cat.slug}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {cat.description?.trim() || `Browse ${cat.name} and related accessories.`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Brands */}
        <section id="shop-by-brand" className="scroll-mt-24 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Shop by brand</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-xl">
                Samsung, Apple, and the rest — configured as brands in admin, shown here with logos when
                you add them.
              </p>
            </div>
          </div>

          {brands.length === 0 ? (
            <div className="bento-card p-10 text-center text-gray-500 text-sm">
              No brands yet. Add them in{" "}
              <span className="font-semibold text-gray-800">Admin → Brands</span>, then assign each
              product in <span className="font-semibold text-gray-800">Admin → Products → Edit</span>.
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:overflow-visible">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={productsHrefForBrand(brand.name)}
                  className="group bento-card flex min-w-[140px] sm:min-w-0 flex-col items-center justify-center gap-3 p-5 text-center transition hover:border-indigo-200"
                >
                  <div className="relative h-14 w-14 rounded-2xl bg-gray-50 ring-1 ring-gray-100 overflow-hidden flex items-center justify-center">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : (
                      <span className="text-lg font-black text-gray-400 group-hover:text-indigo-600 transition">
                        {brand.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-900 line-clamp-2">{brand.name}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
