"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Smartphone, ArrowRight, Trash2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  imageUrl?: string;
  stock: number;
  brand?: string;
}

function fmt(p: number) {
  return "LKR " + p.toLocaleString("en-LK");
}

export default function WishlistPage() {
  const { ids, toggle } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productIds = Array.from(ids);
    if (productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/products/batch?ids=${productIds.join(",")}`)
      .then((r) => r.ok ? r.json() : { products: [] })
      .then(({ products: p }) => setProducts(p ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [ids]);

  function handleAddToCart(p: WishlistProduct) {
    addItem({ id: p.id, productId: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl });
  }

  return (
    <div className="bento-bg min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Page header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
              Your Collection
            </span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 flex items-center gap-3">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
              Wishlist
            </h1>
            {ids.size > 0 && (
              <span className="text-sm text-[var(--muted)]">
                {ids.size} {ids.size === 1 ? "item" : "items"}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(Math.max(ids.size, 4))].map((_, i) => (
              <div key={i} className="bento-card p-4 animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-2xl mb-3" />
                <div className="h-3 bg-gray-100 rounded-full mb-2 w-3/4" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : ids.size === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center mb-5">
              <Heart className="w-10 h-10 text-rose-300" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-[var(--muted)] mb-6 max-w-xs">
              Tap the heart on any product to save it here for later.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-bold hover:bg-indigo-600 transition-colors"
            >
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product, i) => {
              const discount = product.comparePrice && product.comparePrice > product.price
                ? Math.round((1 - product.price / product.comparePrice) * 100)
                : null;

              return (
                <div
                  key={product.id}
                  className="bento-card p-4 flex flex-col group animate-slide-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Image */}
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 aspect-square mb-3 overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Smartphone className="w-10 h-10 text-gray-400" />
                        </div>
                      )}

                      {discount && (
                        <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          -{discount}%
                        </span>
                      )}

                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                          <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-full">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Brand */}
                  {product.brand && (
                    <p className="text-[11px] text-gray-400 mb-0.5 truncate">{product.brand}</p>
                  )}

                  {/* Name */}
                  <Link href={`/products/${product.slug}`}>
                    <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2 mb-2 hover:text-indigo-600 transition-colors">
                      {product.name}
                    </p>
                  </Link>

                  {/* Price */}
                  <div className="mt-auto">
                    <p className="text-xs font-black text-gray-900">{fmt(product.price)}</p>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <p className="text-[10px] text-gray-400 line-through">{fmt(product.comparePrice)}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-1.5 mt-2.5">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-900 hover:bg-indigo-600 disabled:bg-gray-200 text-white text-[11px] font-bold transition-colors"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Add
                      </button>
                      <button
                        onClick={() => toggle(product.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-500 transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
