"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isLocalProductUploadUrl, normalizeProductImageUrl } from "@/lib/product-image-url";
import Image from "next/image";
import { Heart, ShoppingCart, Smartphone, ArrowRight, Trash2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";

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
    <div className="acct-bg">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <AccountPageHeader
          eyebrow="Your collection"
          title="Wishlist"
          subtitle="Products you've saved for later"
          icon={Heart}
          action={
            ids.size > 0 ? (
              <span className="acct-chip acct-chip-blue !text-xs !px-3 !py-1">
                {ids.size} {ids.size === 1 ? "item" : "items"}
              </span>
            ) : undefined
          }
        />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(Math.max(ids.size, 4))].map((_, i) => (
              <div key={i} className="acct-glass p-4 animate-pulse">
                <div className="aspect-square bg-black/5 rounded-2xl mb-3" />
                <div className="h-3 bg-black/5 rounded-full mb-2 w-3/4" />
                <div className="h-3 bg-black/5 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : ids.size === 0 ? (
          <div className="acct-glass flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-5">
              <Heart className="w-10 h-10 text-[var(--brand-600)]" />
            </div>
            <h2 className="text-xl font-black text-neutral-900 mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-neutral-500 mb-6 max-w-xs">
              Tap the heart on any product to save it here for later.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-bold hover:bg-[var(--brand-600)] transition-colors"
            >
              Browse products <ArrowRight className="w-4 h-4" />
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
                  className="acct-glass acct-glass-hover p-3 flex flex-col group acct-rise"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative rounded-2xl bg-gradient-to-br from-white to-sky-50 border border-white/80 aspect-square mb-3 overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          src={normalizeProductImageUrl(product.imageUrl)}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, 25vw"
                          unoptimized={isLocalProductUploadUrl(product.imageUrl)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Smartphone className="w-10 h-10 text-neutral-300" />
                        </div>
                      )}

                      {discount && (
                        <span className="absolute top-2 left-2 acct-chip acct-chip-solid !text-[10px]">
                          -{discount}%
                        </span>
                      )}

                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="text-xs font-bold text-white bg-black/60 backdrop-blur px-3 py-1 rounded-full">
                            Out of stock
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {product.brand && (
                    <p className="text-[11px] text-neutral-400 mb-0.5 truncate">{product.brand}</p>
                  )}

                  <Link href={`/products/${product.slug}`}>
                    <p className="text-xs font-bold text-neutral-900 leading-snug line-clamp-2 mb-2 hover:text-[var(--brand-600)] transition-colors">
                      {product.name}
                    </p>
                  </Link>

                  <div className="mt-auto">
                    <p className="text-sm font-black text-neutral-900">{fmt(product.price)}</p>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <p className="text-[10px] text-neutral-400 line-through">{fmt(product.comparePrice)}</p>
                    )}

                    <div className="flex gap-1.5 mt-2.5">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full bg-neutral-900 hover:bg-[var(--brand-600)] disabled:bg-neutral-300 text-white text-[11px] font-bold transition-colors"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Add
                      </button>
                      <button
                        onClick={() => toggle(product.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center border border-black/10 bg-white/60 hover:border-[var(--brand-500)] hover:text-[var(--brand-600)] text-neutral-500 transition-colors"
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
