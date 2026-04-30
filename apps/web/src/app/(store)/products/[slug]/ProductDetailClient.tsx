"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";

export type ProductVariantOption = {
  id: string;
  name: string;
  stock: number;
  /** Resolved sale price (variant override or base product price). */
  price: number;
};

export type ProductDetailPayload = {
  id: string;
  name: string;
  slug: string;
  /** Base product price when no variant or variant has no override. */
  price: number;
  stock: number;
  sku?: string | null;
  imageUrl?: string;
  variants: ProductVariantOption[];
};

export function ProductDetailClient({ product }: { product: ProductDetailPayload }) {
  const router = useRouter();
  const { addItem, clearCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantOption | null>(
    product.variants.length > 0
      ? product.variants.find((v) => v.stock > 0) ?? null
      : null
  );
  const [added, setAdded] = useState(false);

  const unitPrice = useMemo(() => {
    if (selectedVariant) return selectedVariant.price;
    return product.price;
  }, [product.price, selectedVariant]);

  const outOfStock = selectedVariant
    ? selectedVariant.stock === 0
    : product.variants.length > 0
      ? !selectedVariant
      : product.stock === 0;

  function buildCartPayload(qty = 1) {
    const variant = selectedVariant;
    const cartLineId = variant ? `${product.id}-${variant.id}` : product.id;
    return {
      id: cartLineId,
      productId: product.id,
      variantId: variant?.id,
      variantName: variant?.name,
      name: product.name,
      slug: product.slug,
      price: unitPrice,
      imageUrl: product.imageUrl,
      sku: product.sku ?? undefined,
      quantity: qty,
    };
  }

  function handleAddToCart() {
    if (outOfStock) return;
    addItem(buildCartPayload(1));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    if (outOfStock) return;
    clearCart();
    addItem(buildCartPayload(1));
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col gap-4">
      {product.variants.length > 0 && (
        <div>
          <p className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2.5">
            Variant
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              const soldOut = v.stock === 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => !soldOut && setSelectedVariant(v)}
                  disabled={soldOut}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                    soldOut
                      ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                      : isSelected
                        ? "border-gray-900 bg-gray-900 text-white shadow-sm scale-[1.03]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:text-gray-900"
                  }`}
                >
                  {v.name}
                  {!soldOut && v.stock <= 3 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-400 rounded-full text-[8px] font-black text-white flex items-center justify-center">
                      {v.stock}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
            <p className="mt-2 text-xs text-amber-600 font-semibold">
              Only {selectedVariant.stock} left in this variant
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
            outOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : added
                ? "bg-emerald-500 text-white scale-[0.98]"
                : "bg-gray-900 hover:bg-indigo-600 text-white active:scale-[0.97] shadow-sm hover:shadow-indigo-200"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {outOfStock ? "Out of Stock" : added ? "Added!" : "Add to Cart"}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all duration-200"
        >
          <Zap className="w-4 h-4" />
          Buy Now
        </button>
      </div>
    </div>
  );
}
