"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Star, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/products/ProductCard";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 16;

const SORT_OPTIONS = [
  { label: "Latest",         value: "latest"     },
  { label: "Price ↑",        value: "price_asc"  },
  { label: "Price ↓",        value: "price_desc" },
  { label: "Top Rated",      value: "rating"     },
  { label: "Most Popular",   value: "popular"    },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

interface Filters {
  categories: string[];
  brands:     string[];
  minPrice:   string;
  maxPrice:   string;
  minRating:  number;
  inStockOnly: boolean;
}

const DEFAULT_FILTERS: Filters = {
  categories:  [],
  brands:      [],
  minPrice:    "",
  maxPrice:    "",
  minRating:   0,
  inStockOnly: false,
};

// ─── Component ────────────────────────────────────────────────────────────────
export function ProductsClient({ products }: { products: ProductCardData[] }) {
  const searchParams = useSearchParams();
  const urlSyncKey = useRef<string | null>(null);

  const [sort, setSort]           = useState<SortValue>("latest");
  const [filters, setFilters]     = useState<Filters>(DEFAULT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);

  useEffect(() => {
    const key = searchParams.toString();
    if (urlSyncKey.current === key) return;
    const cat = searchParams.get("category");
    const brand = searchParams.get("brand");
    if (!cat && !brand) {
      urlSyncKey.current = key;
      return;
    }
    urlSyncKey.current = key;
    setFilters((prev) => ({
      ...prev,
      ...(cat ? { categories: [decodeURIComponent(cat)] } : {}),
      ...(brand ? { brands: [decodeURIComponent(brand)] } : {}),
    }));
    setPage(1);
  }, [searchParams]);

  // ── Derived filter options from passed products ─────────────────────────────
  const CATEGORIES = useMemo(
    () => [...new Set(products.map((p) => p.category).filter((c): c is string => !!c))].sort(),
    [products],
  );
  const BRANDS = useMemo(
    () => [...new Set(products.map((p) => p.brand).filter((b): b is string => !!b))].sort(),
    [products],
  );

  // ── Derived list ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = [...products];

    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    }
    if (filters.categories.length)
      r = r.filter((p) => p.category && filters.categories.includes(p.category));
    if (filters.brands.length)
      r = r.filter((p) => p.brand && filters.brands.includes(p.brand));
    if (filters.minPrice)
      r = r.filter((p) => p.price >= Number(filters.minPrice) * 1000);
    if (filters.maxPrice)
      r = r.filter((p) => p.price <= Number(filters.maxPrice) * 1000);
    if (filters.minRating)
      r = r.filter((p) => (p.rating ?? 0) >= filters.minRating);
    if (filters.inStockOnly)
      r = r.filter((p) => p.stock > 0);

    if (sort === "price_asc")  r.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") r.sort((a, b) => b.price - a.price);
    if (sort === "rating")     r.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === "popular")    r.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));

    return r;
  }, [products, sort, filters, search]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const paginated   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeCount =
    filters.categories.length +
    filters.brands.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function resetPage() { setPage(1); }

  function toggle(key: "categories" | "brands", value: string) {
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value)
        ? f[key].filter((x) => x !== value)
        : [...f[key], value],
    }));
    resetPage();
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
    resetPage();
  }

  // ── Filter panel content (shared by sidebar + drawer) ───────────────────────
  const filterContent = (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Category */}
      <div>
        <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-3">
          Category
        </p>
        <div className="flex flex-col gap-2.5">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => toggle("categories", cat)}
                className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-3">
          Brand
        </p>
        <div className="flex flex-col gap-2.5">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => toggle("brands", brand)}
                className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-3">
          Price (LKR 000s)
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
                  onChange={(e) => { setFilters((f) => ({ ...f, minPrice: e.target.value })); resetPage(); }}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <span className="text-gray-400 text-sm shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
                  onChange={(e) => { setFilters((f) => ({ ...f, maxPrice: e.target.value })); resetPage(); }}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-3">
          Min Rating
        </p>
        <div className="flex flex-col gap-2.5">
          {[4, 3, 2].map((r) => (
            <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="rating-filter"
                checked={filters.minRating === r}
                onChange={() => setFilters((f) => ({ ...f, minRating: f.minRating === r ? 0 : r }))}
                className="accent-indigo-600 cursor-pointer"
              />
              <div className="flex items-center gap-0.5">
                {Array.from({ length: r }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-sm text-gray-600 ml-1">{r}+ stars</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-3">
          Availability
        </p>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => { setFilters((f) => ({ ...f, inStockOnly: e.target.checked })); resetPage(); }}
            className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
          />
          <span className="text-sm text-gray-700">In stock only</span>
        </label>
      </div>

      {activeCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full py-2 rounded-xl border border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-50 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bento-bg min-h-screen">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5 lg:px-8 py-6">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">All Products</h1>
            <p className="text-sm text-gray-400 mt-0.5">{filtered.length} products found</p>
          </div>

          {/* Mobile filter button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 bento-card px-4 py-2 text-sm font-semibold text-gray-700"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeCount > 0 && (
              <span className="w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-6 items-start">
          {/* ── Desktop sidebar */}
          <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className="bento-card p-5 sticky top-4">
              <div className="flex items-center justify-between mb-5">
                <p className="font-extrabold text-gray-900">Filters</p>
                {activeCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {filterContent}
            </div>
          </aside>

          {/* ── Main content */}
          <div className="flex-1 min-w-0">

            {/* Sort bar */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <span className="text-xs font-semibold text-gray-500 mr-1">Sort:</span>
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

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="bento-card p-16 flex flex-col items-center text-center gap-3">
                <p className="text-4xl">🔍</p>
                <p className="font-bold text-gray-900">No products found</p>
                <p className="text-sm text-gray-400">Try adjusting your filters or search term</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-indigo-600 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {paginated.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-1.5">
                    {/* Prev */}
                    <button
                      onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={safePage === 1}
                      className="w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                      const isActive = n === safePage;
                      const nearActive = Math.abs(n - safePage) <= 1;
                      const isEdge = n === 1 || n === totalPages;
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

                    {/* Next */}
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

      {/* ── Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl overflow-y-auto flex flex-col">
            {/* Drawer header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
              <p className="font-extrabold text-gray-900">Filters</p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Drawer content */}
            <div className="flex-1 p-5">{filterContent}</div>

            {/* Drawer footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-colors"
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
