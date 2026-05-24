"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  SlidersHorizontal, X, Star, Search, ChevronLeft,
  ChevronRight, Filter,
} from "lucide-react";
import {
  TopSellingProductCard,
  type TopSellingProductData,
} from "@/components/home/TopSellingProductCard";
import type { ProductCardData } from "@/components/products/ProductCard";

export type CategoryFilterOption = { slug: string; name: string };

function toTopSellingProduct(product: ProductCardData): TopSellingProductData {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    comparePrice: product.comparePrice,
    imageUrl: product.imageUrl,
    stock: product.stock,
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 16;

const SORT_OPTIONS = [
  { label: "Latest",       value: "latest"     },
  { label: "Price ↑",     value: "price_asc"  },
  { label: "Price ↓",     value: "price_desc" },
  { label: "Top Rated",   value: "rating"     },
  { label: "Most Popular",value: "popular"    },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

interface Filters {
  brands: string[];
  minPrice: string;
  maxPrice: string;
  minRating: number;
  inStockOnly: boolean;
}

const DEFAULT_FILTERS: Filters = {
  brands: [],
  minPrice: "",
  maxPrice: "",
  minRating: 0,
  inStockOnly: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function matchCategory(param: string, available: string[]): string | undefined {
  return available.find((c) => c.toLowerCase() === param.toLowerCase());
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ProductsClient({
  products,
  initialBrand,
  listTitle,
  brandFilterNames,
  categoryFilterOptions = [],
}: Readonly<{
  products: ProductCardData[];
  /** Pre-select this brand (display name, e.g. "Apple") when present on products */
  initialBrand?: string | null;
  /** Override the main heading (e.g. brand name on `/products/brands/apple`) */
  listTitle?: string;
  /** Active brands from DB — merged into the Brand filter so names always match the catalog */
  brandFilterNames?: readonly string[];
  /** Active categories from DB for the sidebar filter */
  categoryFilterOptions?: readonly CategoryFilterOption[];
}>) {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();
  const isMounted    = useRef(false);

  // ── Derived filter options ──────────────────────────────────────────────────
  const BRANDS = useMemo(() => {
    const fromProducts = products
      .map((p) => p.brand)
      .filter((b): b is string => !!b);
    const fromCatalog = brandFilterNames ?? [];
    return [...new Set([...fromProducts, ...fromCatalog])].sort((a, b) =>
      a.localeCompare(b, "en", { sensitivity: "base" }),
    );
  }, [products, brandFilterNames]);

  // ── State — initialised from URL on first render ────────────────────────────
  const [sort, setSort] = useState<SortValue>("latest");
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [filters, setFilters] = useState<Filters>(() => {
    const brandParam = searchParams.get("brand");
    let brandsInit: string[] = [];
    if (brandParam && matchCategory(brandParam, BRANDS)) {
      brandsInit = [matchCategory(brandParam, BRANDS)!];
    } else if (initialBrand && matchCategory(initialBrand, BRANDS)) {
      brandsInit = [matchCategory(initialBrand, BRANDS)!];
    }
    return {
      ...DEFAULT_FILTERS,
      brands: brandsInit,
      minPrice:   searchParams.get("minPrice")  ?? "",
      maxPrice:   searchParams.get("maxPrice")  ?? "",
      minRating:  Number(searchParams.get("minRating") ?? 0),
      inStockOnly: searchParams.get("inStock") === "1",
    };
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage]             = useState(1);
  const [categorySlug, setCategorySlug] = useState(() =>
    (searchParams.get("category") ?? "").toLowerCase().trim(),
  );

  useEffect(() => {
    setCategorySlug((searchParams.get("category") ?? "").toLowerCase().trim());
  }, [searchParams]);

  // ── Sync state → URL (skip initial mount) ──────────────────────────────────
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filters.brands.length === 1) params.set("brand", filters.brands[0].toLowerCase());
    if (filters.minPrice)                params.set("minPrice",  filters.minPrice);
    if (filters.maxPrice)                params.set("maxPrice",  filters.maxPrice);
    if (filters.minRating > 0)           params.set("minRating", String(filters.minRating));
    if (filters.inStockOnly)             params.set("inStock",   "1");
    if (categorySlug)                    params.set("category", categorySlug);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [search, filters, sort, categorySlug]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filtered + sorted list ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = [...products];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((p) => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }
    if (categorySlug) {
      r = r.filter((p) => (p.categorySlug ?? "").toLowerCase() === categorySlug);
    }
    if (filters.brands.length) r = r.filter((p) => p.brand && filters.brands.includes(p.brand));
    if (filters.minPrice)          r = r.filter((p) => p.price >= Number(filters.minPrice) * 1000);
    if (filters.maxPrice)          r = r.filter((p) => p.price <= Number(filters.maxPrice) * 1000);
    if (filters.minRating)         r = r.filter((p) => (p.rating ?? 0) >= filters.minRating);
    if (filters.inStockOnly)       r = r.filter((p) => p.stock > 0);

    if (sort === "price_asc")  r.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") r.sort((a, b) => b.price - a.price);
    if (sort === "rating")     r.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === "popular")    r.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    return r;
  }, [products, sort, filters, search, categorySlug]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeCount =
    filters.brands.length +
    (categorySlug ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function resetPage() { setPage(1); }

  function toggleBrand(value: string) {
    setFilters((f) => ({
      ...f,
      brands: f.brands.includes(value) ? f.brands.filter((x) => x !== value) : [...f.brands, value],
    }));
    resetPage();
  }

  function toggleCategory(slug: string) {
    setCategorySlug((current) => (current === slug ? "" : slug));
    resetPage();
  }

  const activeCategoryName = categoryFilterOptions.find(
    (c) => c.slug.toLowerCase() === categorySlug,
  )?.name;

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
    setCategorySlug("");
    resetPage();
  }

  // ── Active filter chips ─────────────────────────────────────────────────────
  const chips: { label: string; onRemove: () => void }[] = [
    ...(categorySlug
      ? [{
          label: `Category: ${activeCategoryName ?? categorySlug}`,
          onRemove: () => { setCategorySlug(""); resetPage(); },
        }]
      : []),
    ...filters.brands.map((b) => ({
      label: b,
      onRemove: () => {
        toggleBrand(b);
      },
    })),
    ...(filters.minPrice || filters.maxPrice
      ? [{
          label: `LKR ${filters.minPrice || "0"}k – ${filters.maxPrice ? filters.maxPrice + "k" : "∞"}`,
          onRemove: () => { setFilters((f) => ({ ...f, minPrice: "", maxPrice: "" })); resetPage(); },
        }]
      : []),
    ...(filters.minRating > 0
      ? [{
          label: `${filters.minRating}+ stars`,
          onRemove: () => { setFilters((f) => ({ ...f, minRating: 0 })); resetPage(); },
        }]
      : []),
    ...(filters.inStockOnly
      ? [{
          label: "In stock",
          onRemove: () => { setFilters((f) => ({ ...f, inStockOnly: false })); resetPage(); },
        }]
      : []),
  ];

  // ── Filter panel shared content ─────────────────────────────────────────────
  const filterPanel = (
    <div className="flex flex-col gap-6">

      {/* Category */}
      {categoryFilterOptions.length > 0 && (
        <div>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Category</p>
          <div className="flex flex-col gap-2">
            {categoryFilterOptions.map((category) => {
              const slug = category.slug.toLowerCase();
              const active = categorySlug === slug;
              return (
                <label key={category.slug} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                      active
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300 group-hover:border-blue-400"
                    }`}
                    onClick={() => toggleCategory(slug)}
                  >
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <input
                    type="radio"
                    className="sr-only"
                    name="category-filter"
                    checked={active}
                    onChange={() => toggleCategory(slug)}
                  />
                  <span className={`text-sm transition-colors ${active ? "text-gray-900 font-semibold" : "text-gray-600 group-hover:text-gray-900"}`}>
                    {category.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand */}
      <div>
        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Brand</p>
        <div className="flex flex-col gap-2">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                  filters.brands.includes(brand)
                    ? "bg-blue-600 border-blue-600"
                    : "border-gray-300 group-hover:border-blue-400"
                }`}
                onClick={() => toggleBrand(brand)}
              >
                {filters.brands.includes(brand) && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <input type="checkbox" className="sr-only" checked={filters.brands.includes(brand)} onChange={() => toggleBrand(brand)} />
              <span className={`text-sm transition-colors ${filters.brands.includes(brand) ? "text-gray-900 font-semibold" : "text-gray-600 group-hover:text-gray-900"}`}>
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Price (LKR 000s)</p>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => { setFilters((f) => ({ ...f, minPrice: e.target.value })); resetPage(); }}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <span className="text-gray-300 text-sm shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => { setFilters((f) => ({ ...f, maxPrice: e.target.value })); resetPage(); }}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        {/* Quick presets */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Under 20k", min: "", max: "20" },
            { label: "20k–50k",  min: "20", max: "50" },
            { label: "50k–100k", min: "50", max: "100" },
            { label: "100k+",    min: "100", max: "" },
          ].map((p) => {
            const active = filters.minPrice === p.min && filters.maxPrice === p.max;
            return (
              <button
                key={p.label}
                onClick={() => {
                  setFilters((f) => ({ ...f, minPrice: p.min, maxPrice: p.max }));
                  resetPage();
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating */}
      <div>
        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Min Rating</p>
        <div className="flex flex-col gap-2">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => { setFilters((f) => ({ ...f, minRating: f.minRating === r ? 0 : r })); resetPage(); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                filters.minRating === r
                  ? "border-amber-400 bg-amber-50"
                  : "border-gray-200 hover:border-amber-300 bg-white"
              }`}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < r ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                ))}
              </div>
              <span className="text-gray-600 font-medium">{r}+ stars</span>
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Availability</p>
        <button
          onClick={() => { setFilters((f) => ({ ...f, inStockOnly: !f.inStockOnly })); resetPage(); }}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border w-full text-sm transition-all ${
            filters.inStockOnly
              ? "border-emerald-400 bg-emerald-50 text-emerald-800"
              : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
          }`}
        >
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${filters.inStockOnly ? "bg-emerald-500 border-emerald-500" : "border-gray-300"}`}>
            {filters.inStockOnly && (
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          In stock only
        </button>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="bento-bg min-h-screen">
      <div className="max-w-350 mx-auto px-3 sm:px-5 lg:px-8 py-6">

        {/* ── Page header + search ──────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{listTitle ?? "All Products"}</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {filtered.length} {filtered.length === 1 ? "product" : "products"} found
              </p>
            </div>
            {/* Mobile filter button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 bento-card px-4 py-2.5 text-sm font-semibold text-gray-700"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeCount > 0 && (
                <span className="w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* Search bar — full width, prominent */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or brand…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              className="w-full pl-11 pr-10 py-3 rounded-2xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-shadow"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); resetPage(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {chips.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs font-semibold text-gray-400">Active:</span>
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-full"
                >
                  {chip.label}
                  <button
                    onClick={chip.onRemove}
                    className="w-3.5 h-3.5 rounded-full hover:bg-blue-200 flex items-center justify-center transition-colors"
                    aria-label={`Remove ${chip.label} filter`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-6 items-start">
          {/* ── Desktop sidebar ────────────────────────────────────────────── */}
          <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className="bento-card p-5 sticky top-4">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                  <p className="font-extrabold text-gray-900 text-sm">Filters</p>
                </div>
                {activeCount > 0 && (
                  <span className="w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </div>
              {filterPanel}
              {activeCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full mt-6 py-2 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </aside>

          {/* ── Main content ───────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Sort bar */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <span className="text-xs font-semibold text-gray-400 mr-1">Sort:</span>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); resetPage(); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                    sort === opt.value
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bento-card text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Grid or empty state */}
            {filtered.length === 0 ? (
              <div className="bento-card p-16 flex flex-col items-center text-center gap-3">
                <p className="text-5xl">🔍</p>
                <p className="font-bold text-gray-900 text-lg">No products found</p>
                <p className="text-sm text-gray-400 max-w-xs">
                  {search
                    ? `No results for "${search}". Try a different term or remove some filters.`
                    : "Try adjusting your filters to see more products."}
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-2 px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-blue-600 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {paginated.map((product) => (
                    <div key={product.id} className="min-w-0">
                      <TopSellingProductCard product={toTopSellingProduct(product)} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={safePage === 1}
                      className="w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                      const isActive  = n === safePage;
                      const nearActive = Math.abs(n - safePage) <= 1;
                      const isEdge    = n === 1 || n === totalPages;
                      if (!nearActive && !isEdge) {
                        if (n === 2 || n === totalPages - 1) {
                          return <span key={n} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>;
                        }
                        return null;
                      }
                      return (
                        <button
                          key={n}
                          onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className={`w-9 h-9 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                            isActive
                              ? "bg-gray-900 text-white shadow-sm"
                              : "bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {n}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={safePage === totalPages}
                      className="w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ───────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                <p className="font-extrabold text-gray-900">Filters</p>
                {activeCount > 0 && (
                  <span className="w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 p-5">{filterPanel}</div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-2">
              {activeCount > 0 && (
                <button
                  onClick={() => { clearFilters(); setDrawerOpen(false); }}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-2xl text-sm hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-colors text-sm"
              >
                Show {filtered.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
