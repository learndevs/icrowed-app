"use client";

import { useEffect, useRef, useState } from "react";
import { Award, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type BrandFilterOption = {
  name: string;
  slug: string;
  logoUrl: string | null;
};

function BrandLogo({
  name,
  logoUrl,
  size = "md",
}: {
  name: string;
  logoUrl: string | null;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt=""
        className={cn(dim, "shrink-0 rounded object-contain bg-white")}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <span
      className={cn(
        dim,
        "shrink-0 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center",
      )}
      aria-hidden
    >
      <Award className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
    </span>
  );
}

export function BrandCatalogSelect({
  brands,
  value,
  onChange,
  className,
}: Readonly<{
  brands: readonly BrandFilterOption[];
  value: string | null;
  onChange: (brandName: string | null) => void;
  className?: string;
}>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = brands.find((b) => b.name === value) ?? null;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  if (brands.length === 0) return null;

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full min-h-11 items-center gap-2 rounded-full border px-3 py-2 text-left text-xs font-semibold transition-all sm:min-w-[11rem] sm:max-w-[14rem]",
          open || value
            ? "border-sky-300 bg-sky-50 text-gray-900 shadow-sm"
            : "bento-card border-transparent text-gray-600 hover:text-gray-900",
        )}
      >
        {selected ? (
          <BrandLogo name={selected.name} logoUrl={selected.logoUrl} size="sm" />
        ) : (
          <Award className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
        )}
        <span className="min-w-0 flex-1 truncate">{selected?.name ?? "All brands"}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Filter by brand"
          className="absolute left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto overscroll-contain rounded-2xl border border-gray-200 bg-white py-1 shadow-lg sm:right-auto sm:min-w-full"
        >
          <li role="option" aria-selected={!value}>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={cn(
                "flex w-full min-h-11 items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 active:bg-gray-100",
                !value && "bg-sky-50 font-semibold text-gray-900",
              )}
            >
              <Award className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
              <span className="flex-1 truncate">All brands</span>
              {!value && <Check className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />}
            </button>
          </li>
          {brands.map((brand) => {
            const active = value === brand.name;
            return (
              <li key={brand.slug} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(brand.name);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full min-h-11 items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 active:bg-gray-100",
                    active && "bg-sky-50 font-semibold text-gray-900",
                  )}
                >
                  <BrandLogo name={brand.name} logoUrl={brand.logoUrl} />
                  <span className="flex-1 truncate">{brand.name}</span>
                  {active && <Check className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
