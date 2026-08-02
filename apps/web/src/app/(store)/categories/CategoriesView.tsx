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

const CATEGORY_GLASS_GRADIENT =
  "bg-gradient-to-br from-white/95 via-gray-100/85 to-slate-200/70";

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
  return `/categories/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"))}`;
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
        <section className="relative overflow-hidden rounded-[28px] border border-black/[0.06] bg-gradient-to-br from-gray-900 via-sky-950 to-sky-900 text-white shadow-xl animate-fade-in">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div className="max-w-2xl space-y-4">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-sky-100 ring-1 ring-white/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  Shop the collection
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                  Categories &amp; brands
                  <span className="block text-sky-200/90 text-2xl sm:text-3xl lg:text-4xl mt-1 font-extrabold">
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
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-gray-900 shadow-lg shadow-black/20 transition hover:bg-sky-50"
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
                    className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-sky-100 underline-offset-4 hover:underline"
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
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-200/80">
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
              className="text-sm font-semibold text-sky-600 hover:text-sky-800 inline-flex items-center gap-1"
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
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {categories.map((cat, i) => {
                const Icon = categoryIcon(cat.slug);
                return (
                  <Link
                    key={cat.id}
                    href={productsHrefForCategory(cat.name)}
                    className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/70 bg-white/55 backdrop-blur-xl shadow-[0_10px_26px_rgba(15,23,42,0.10)] hover:shadow-[0_16px_34px_rgba(15,23,42,0.14)] transition-all duration-300 flex flex-col text-left animate-slide-up"
                    style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-gray-200/45" />
                    <div
                      className={`relative h-32 sm:h-44 lg:h-52 overflow-hidden ${CATEGORY_GLASS_GRADIENT}`}
                    >
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="absolute inset-0 h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600/90" strokeWidth={1.25} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-200/45 via-transparent to-white/30" />
                    </div>

                    <div className="relative p-3 sm:p-5 flex-1 flex flex-col min-h-[120px] sm:min-h-[150px]">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm sm:text-lg font-black text-gray-900 line-clamp-2">{cat.name}</p>
                        <span className="shrink-0 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/85 bg-white/75 text-gray-700 transition group-hover:bg-white group-hover:text-gray-900">
                          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs font-mono text-gray-500/90 mt-1 mb-1.5">
                        /{cat.slug}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed">
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
                  className="group bento-card flex min-w-[140px] sm:min-w-0 flex-col items-center justify-center gap-3 p-5 text-center transition hover:border-sky-200"
                >
                  <div className="relative h-14 w-14 rounded-2xl bg-gray-50 ring-1 ring-gray-100 overflow-hidden flex items-center justify-center">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : (
                      <span className="text-lg font-black text-gray-400 group-hover:text-sky-600 transition">
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
