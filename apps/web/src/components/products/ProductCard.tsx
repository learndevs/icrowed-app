"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Smartphone } from "lucide-react";
import { useCart } from "@/context/CartContext";

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

export function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();

  const gradient =
    product.color ?? GRADIENTS[parseInt(product.id, 10) % GRADIENTS.length];

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : null;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="bento-card p-4 flex flex-col group"
    >
      {/* Image / gradient area */}
      <div
        className={`relative rounded-2xl bg-gradient-to-br ${gradient} aspect-square mb-3 flex items-center justify-center overflow-hidden`}
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <Smartphone className="w-10 h-10 text-white/70 group-hover:scale-110 transition-transform duration-300" />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && (
            <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.isNew && !discount && (
            <span className="bg-white/90 text-gray-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              New
            </span>
          )}
          {product.badge && !product.isNew && !discount && (
            <span className="bg-white/90 text-gray-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {product.badge}
            </span>
          )}
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
            <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-full">
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
      <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2 mb-1">
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
          <p className="text-xs font-black text-gray-900">{fmt(product.price)}</p>
          {product.comparePrice && product.comparePrice > product.price && (
            <p className="text-[10px] text-gray-400 line-through">
              {fmt(product.comparePrice)}
            </p>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-8 h-8 rounded-full bg-gray-900 hover:bg-indigo-600 disabled:bg-gray-300 flex items-center justify-center transition-colors shrink-0"
          aria-label="Add to cart"
        >
          <ShoppingCart className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </Link>
  );
}
