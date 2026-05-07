"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Smartphone, Ban } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const GRADIENTS = [
  "from-indigo-500 to-blue-600",
  "from-gray-700 to-gray-900",
  "from-teal-500 to-emerald-600",
  "from-rose-500 to-red-600",
  "from-orange-500 to-amber-600",
  "from-violet-500 to-purple-600",
  "from-sky-500 to-cyan-600",
  "from-pink-500 to-rose-600",
];

function fmt(p: number) {
  return "LKR " + p.toLocaleString("en-LK");
}

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  stock: number;
  isNew?: boolean;
  badge?: string;
  /** tailwind gradient e.g. "from-indigo-500 to-blue-600" */
  color?: string;
  brand?: string;
  category?: string;
}

export function ProductCard({ product }: Readonly<{ product: ProductCardData }>) {
  const { addItem } = useCart();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();

  const isOOS      = product.stock === 0;
  const isLowStock = !isOOS && product.stock <= 5;

  const gradient =
    product.color ?? GRADIENTS[Number.parseInt(product.id, 10) % GRADIENTS.length];

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : null;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (isOOS) return;
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`bento-card p-4 flex flex-col transition-all duration-200 ${
        isOOS ? "opacity-70" : "group hover:shadow-md"
      }`}
    >
      {/* Image / gradient area */}
      <div
        className={`relative rounded-2xl bg-linear-to-br ${gradient} aspect-square mb-3 flex items-center justify-center overflow-hidden`}
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-500 ${
              isOOS ? "grayscale-40" : "group-hover:scale-105"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <Smartphone className={`w-10 h-10 text-white/70 transition-transform duration-300 ${isOOS ? "" : "group-hover:scale-110"}`} />
        )}

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOOS ? (
            <span className="bg-gray-800/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              Sold Out
            </span>
          ) : (
            <>
              {isLowStock && (
                <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  Only {product.stock} left!
                </span>
              )}
              {discount && (
                <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  -{discount}%
                </span>
              )}
              {!discount && product.isNew && (
                <span className="bg-white/90 text-gray-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  New
                </span>
              )}
              {!discount && !product.isNew && product.badge && (
                <span className="bg-white/90 text-gray-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {product.badge}
                </span>
              )}
            </>
          )}
        </div>

        {/* Wishlist heart */}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isWishlisted(product.id) ? "fill-rose-500 text-rose-500" : "text-gray-400"
            }`}
          />
        </button>

        {/* Out-of-stock overlay — frosted glass with icon */}
        {isOOS && (
          <div className="absolute inset-0 rounded-2xl bg-white/25 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1.5">
            <div className="w-9 h-9 rounded-full bg-gray-900/65 flex items-center justify-center">
              <Ban className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[10px] font-bold text-gray-800 bg-white/75 backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Brand */}
      {product.brand && (
        <p className="text-[11px] text-gray-400 mb-0.5 truncate">{product.brand}</p>
      )}

      {/* Name */}
      <p className={`text-xs font-bold leading-snug line-clamp-2 mb-1 ${isOOS ? "text-gray-400" : "text-gray-900"}`}>
        {product.name}
      </p>

      {/* Rating */}
      {product.rating != null && (
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-semibold text-gray-600">
            {product.rating.toFixed(1)}
          </span>
          {product.reviewCount != null && (
            <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
          )}
        </div>
      )}

      {/* Price + cart */}
      <div className="mt-auto flex items-end justify-between gap-2">
        <div>
          <p className={`text-xs font-black ${isOOS ? "text-gray-400" : "text-gray-900"}`}>
            {fmt(product.price)}
          </p>
          {product.comparePrice && product.comparePrice > product.price && (
            <p className="text-[10px] text-gray-400 line-through">
              {fmt(product.comparePrice)}
            </p>
          )}
        </div>

        {isOOS ? (
          <div
            className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0"
            title="Out of stock"
            aria-label="Out of stock"
          >
            <Ban className="w-3.5 h-3.5 text-gray-300" />
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-8 h-8 rounded-full bg-gray-900 hover:bg-indigo-600 flex items-center justify-center transition-colors shrink-0 active:scale-90"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-white" />
          </button>
        )}
      </div>
    </Link>
  );
}
