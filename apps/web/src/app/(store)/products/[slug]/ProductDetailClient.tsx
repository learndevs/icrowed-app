"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, PackageX } from "lucide-react";
import {
  activeVariantDimensions,
  colorSwatchHexByValue,
  formatVariantChoiceLabel,
  normalizeVariantOptions,
  type VariantOptionKey,
  VARIANT_OPTION_LABELS,
} from "@icrowd/database/variant-options";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface ProductVariantRow {
  id: string;
  name: string;
  stock: number;
  price: number | null;
  sku: string | null;
  options: unknown;
}

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    variants: ProductVariantRow[];
    primaryImageUrl: string | null;
  };
}

function matchesPartial(
  v: ProductVariantRow,
  sel: Partial<Record<VariantOptionKey, string>>,
  dims: VariantOptionKey[],
  skipDim: VariantOptionKey,
) {
  const opts = normalizeVariantOptions(v.options);
  for (const d of dims) {
    if (d === skipDim) continue;
    const want = sel[d];
    if (!want) continue;
    if (opts[d] !== want) return false;
  }
  return true;
}

function matchesCurrentSelection(
  v: ProductVariantRow,
  sel: Partial<Record<VariantOptionKey, string>>,
  dims: VariantOptionKey[],
) {
  const opts = normalizeVariantOptions(v.options);
  for (const d of dims) {
    const want = sel[d];
    if (!want) continue;
    if (opts[d] !== want) return false;
  }
  return true;
}

function uniqueValuesForDimension(
  variants: ProductVariantRow[],
  dim: VariantOptionKey,
  dims: VariantOptionKey[],
  sel: Partial<Record<VariantOptionKey, string>>,
): string[] {
  const pool = variants.filter((v) => matchesPartial(v, sel, dims, dim));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of pool) {
    const val = normalizeVariantOptions(v.options)[dim];
    if (val && !seen.has(val)) {
      seen.add(val);
      out.push(val);
    }
  }
  return out;
}

function pickDefaultSelection(variants: ProductVariantRow[], dims: VariantOptionKey[]) {
  const first = variants.find((v) => Number(v.stock) > 0) ?? variants[0];
  if (!first) return {} as Partial<Record<VariantOptionKey, string>>;
  const opts = normalizeVariantOptions(first.options);
  const sel: Partial<Record<VariantOptionKey, string>> = {};
  for (const d of dims) {
    if (opts[d]) sel[d] = opts[d]!;
  }
  return sel;
}

function resolveSelectedVariant(
  variants: ProductVariantRow[],
  sel: Partial<Record<VariantOptionKey, string>>,
  dims: VariantOptionKey[],
): ProductVariantRow | null {
  const candidates = variants.filter((v) => matchesCurrentSelection(v, sel, dims));
  if (candidates.length === 0) return null;
  return candidates.find((v) => Number(v.stock) > 0) ?? candidates[0] ?? null;
}

function BaseStockIndicator({ stock }: Readonly<{ stock: number }>) {
  if (stock === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200">
        <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
          <PackageX className="w-4 h-4 text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-700">Currently unavailable</p>
          <p className="text-xs text-gray-400">This item is out of stock. Check back soon.</p>
        </div>
      </div>
    );
  }

  if (stock <= 10) {
    const veryLow = stock <= 3;
    return (
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
          veryLow ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"
        }`}
      >
        <AlertTriangle className={`w-4 h-4 shrink-0 ${veryLow ? "text-rose-500" : "text-amber-500"}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold ${veryLow ? "text-rose-700" : "text-amber-700"}`}>
            {veryLow ? "Almost gone — only " : "Low stock — only "}
            <span className="font-black">{stock}</span>
            {" left in stock"}
          </p>
          <div className="mt-1.5 h-1.5 bg-white/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${veryLow ? "bg-rose-400" : "bg-amber-400"}`}
              style={{ width: `${Math.min((stock / 10) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function ProductDetailClient({ product }: Readonly<Props>) {
  const { addItem } = useCart();
  const router = useRouter();

  const dims = useMemo(
    () => activeVariantDimensions(product.variants.map((v) => ({ options: v.options }))),
    [product.variants],
  );

  const colorHexByLabel = useMemo(
    () => (dims.includes("color") ? colorSwatchHexByValue(product.variants) : new Map<string, string>()),
    [product.variants, dims],
  );

  const [selection, setSelection] = useState<Partial<Record<VariantOptionKey, string>>>({});
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product.variants.length === 0) {
      setSelection({});
      return;
    }
    setSelection(pickDefaultSelection(product.variants, dims));
  }, [product.id, product.variants, dims]);

  const selectedVariant = useMemo(() => {
    if (product.variants.length === 0) return null;
    return resolveSelectedVariant(product.variants, selection, dims);
  }, [product.variants, selection, dims]);

  const displayPrice = selectedVariant?.price ?? product.price;
  const outOfStock =
    product.variants.length > 0
      ? !selectedVariant || Number(selectedVariant.stock) <= 0
      : Number(product.stock) <= 0;

  const fmt = (p: number) => "LKR " + p.toLocaleString("en-LK");

  function setDimension(dim: VariantOptionKey, value: string) {
    setSelection((prev) => {
      const next = { ...prev, [dim]: value };
      const pool = product.variants.filter((v) => matchesCurrentSelection(v, next, dims));
      if (pool.length === 0) {
        const anchor = product.variants.find(
          (v) => normalizeVariantOptions(v.options)[dim] === value && Number(v.stock) > 0,
        );
        const anchorRow = anchor ?? product.variants.find((v) => normalizeVariantOptions(v.options)[dim] === value);
        if (anchorRow) return pickDefaultSelection([anchorRow], dims);
      }
      return next;
    });
  }

  function addThenFeedback() {
    if (outOfStock) return;
    if (product.variants.length > 0 && !selectedVariant) return;

    const choiceLabel = selectedVariant
      ? formatVariantChoiceLabel(selectedVariant.options, selectedVariant.name)
      : undefined;

    addItem({
      id: selectedVariant?.id ?? product.id,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantName: choiceLabel,
      price: displayPrice,
      sku: selectedVariant?.sku ?? undefined,
      imageUrl: product.primaryImageUrl ?? undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    if (outOfStock) return;
    if (product.variants.length > 0 && !selectedVariant) return;

    const choiceLabel = selectedVariant
      ? formatVariantChoiceLabel(selectedVariant.options, selectedVariant.name)
      : undefined;

    addItem({
      id: selectedVariant?.id ?? product.id,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantName: choiceLabel,
      price: displayPrice,
      sku: selectedVariant?.sku ?? undefined,
      imageUrl: product.primaryImageUrl ?? undefined,
    });
    router.push("/cart");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black text-gray-900">{fmt(displayPrice)}</span>
      </div>

      {product.variants.length === 0 && <BaseStockIndicator stock={product.stock} />}

      {dims.length > 0 && (
        <div className="flex flex-col gap-4">
          {dims.map((dim) => {
            const values = uniqueValuesForDimension(product.variants, dim, dims, selection);
            if (values.length === 0) return null;
            const label = VARIANT_OPTION_LABELS[dim];
            return (
              <div key={dim}>
                <p className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2.5">
                  {label}
                </p>
                <div className="flex flex-wrap gap-3">
                  {values.map((val) => {
                    const isSelected = selection[dim] === val;
                    const anyInStock = product.variants.some(
                      (v) =>
                        normalizeVariantOptions(v.options)[dim] === val &&
                        matchesPartial(v, selection, dims, dim) &&
                        Number(v.stock) > 0,
                    );
                    const soldOut = !anyInStock;
                    const swatchHex = dim === "color" ? colorHexByLabel.get(val) : undefined;

                    if (dim === "color") {
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => !soldOut && setDimension(dim, val)}
                          disabled={soldOut}
                          aria-label={`${VARIANT_OPTION_LABELS[dim]}: ${val}`}
                          className={cn(
                            "transition-transform",
                            soldOut ? "cursor-not-allowed opacity-40" : "hover:scale-[1.02] active:scale-[0.98]",
                          )}
                        >
                          <span
                            className={cn(
                              "relative block w-11 h-11 rounded-full border-2 shadow-inner",
                              !swatchHex && "bg-gradient-to-br from-gray-100 to-gray-300",
                              isSelected
                                ? "ring-2 ring-gray-900 ring-offset-2 border-gray-400"
                                : "border-gray-300 hover:border-gray-500",
                            )}
                            style={swatchHex ? { backgroundColor: swatchHex } : undefined}
                            title={val}
                          />
                        </button>
                      );
                    }

                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => !soldOut && setDimension(dim, val)}
                        disabled={soldOut}
                        className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                          soldOut
                            ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                            : isSelected
                              ? "border-gray-900 bg-gray-900 text-white shadow-sm scale-[1.03]"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:text-gray-900"
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedVariant &&
        selectedVariant.stock > 0 &&
        selectedVariant.stock <= 5 &&
        product.variants.length > 0 && (
          <p className="text-xs text-amber-600 font-semibold">
            Only {selectedVariant.stock} left for this selection
          </p>
        )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={addThenFeedback}
          disabled={outOfStock}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
            outOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : added
                ? "bg-emerald-500 text-white scale-[0.98]"
                : "bg-gray-900 hover:bg-blue-600 text-white active:scale-[0.97] shadow-sm hover:shadow-blue-200"
          }`}
        >
          {outOfStock ? "Out of Stock" : added ? "Added!" : "Add to Cart"}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all duration-200"
        >
          Buy Now
        </button>
      </div>
      {outOfStock && (
        <p className="text-xs text-rose-600 font-semibold">
          This selection is out of stock.
        </p>
      )}
    </div>
  );
}
