"use client";

import { useState } from "react";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface Variant {
  id: string;
  name: string;
  stock: number;
  price: number | null;
  sku: string | null;
}

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
    comparePrice?: number;
    stock: number;
    variants: Variant[];
    primaryImageUrl: string | null;
  };
}

export function ProductDetailClient({ product }: Props) {
  const { addItem } = useCart();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants.find((v) => v.stock > 0) ?? null
  );
  const [added, setAdded] = useState(false);

  const displayPrice = selectedVariant?.price ?? product.price;
  const outOfStock = selectedVariant ? selectedVariant.stock === 0 : product.stock === 0;

  const fmt = (p: number) => "LKR " + p.toLocaleString("en-LK");

  const discount = product.comparePrice
    ? Math.round((1 - displayPrice / product.comparePrice) * 100)
    : null;

  function handleAddToCart() {
    if (outOfStock) return;
    addItem({
      id: selectedVariant?.id ?? product.id,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantName: selectedVariant?.name,
      price: displayPrice,
      sku: selectedVariant?.sku ?? undefined,
      imageUrl: product.primaryImageUrl ?? undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Price — reactive to variant selection */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black text-gray-900">{fmt(displayPrice)}</span>
        {product.comparePrice && (
          <span className="text-base text-gray-400 line-through">{fmt(product.comparePrice)}</span>
        )}
        {discount && discount > 0 && (
          <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
            Save {fmt(product.comparePrice! - displayPrice)}
          </span>
        )}
      </div>

      {/* Variants */}
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
                  {v.price && v.price !== product.price && (
                    <span className={`ml-1.5 ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
                      {fmt(v.price)}
                    </span>
                  )}
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

      {/* CTA buttons */}
      <div className="flex gap-3">
        <button
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
          disabled={outOfStock}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all duration-200"
        >
          <Zap className="w-4 h-4" />
          Buy Now
        </button>

        <button
          onClick={() => toggleWishlist(product.id)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-200 active:scale-[0.97] ${
            isWishlisted(product.id)
              ? "border-rose-300 bg-rose-50 text-rose-500"
              : "border-gray-200 bg-white text-gray-400 hover:border-rose-200 hover:text-rose-400"
          }`}
          aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart className={`w-5 h-5 ${isWishlisted(product.id) ? "fill-rose-500" : ""}`} />
        </button>
      </div>
    </div>
  );
}
