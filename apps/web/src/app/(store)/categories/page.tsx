import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Tag } from "lucide-react";
import { getCategories } from "@icrowed/database/queries";

export const metadata: Metadata = { title: "Categories | iCrowed" };

const CATEGORY_GLASS_GRADIENT =
  "bg-gradient-to-br from-white/95 via-gray-100/85 to-slate-200/70";

export default async function CategoriesPage() {
  const categories = await getCategories().catch(() => []);

  return (
    <div className="bento-bg min-h-screen">
      <div className="px-3 sm:px-5 lg:px-8 py-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Tag className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">Browse</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            All Categories
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Find exactly what you&apos;re looking for
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="bento-card p-12 text-center">
            <p className="text-gray-400 text-sm">No categories available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/70 bg-white/55 backdrop-blur-xl shadow-[0_10px_26px_rgba(15,23,42,0.10)] hover:shadow-[0_16px_34px_rgba(15,23,42,0.14)] transition-all duration-300 flex flex-col"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-gray-200/45" />
                {/* Image or glass placeholder */}
                <div
                  className={`relative w-full h-32 sm:h-40 lg:h-48 rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center ${CATEGORY_GLASS_GRADIENT}`}
                >
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      width={300}
                      height={169}
                      className="object-cover object-top w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <Tag className="w-8 h-8 text-gray-500/80" />
                  )}
                </div>

                {/* Info */}
                <div className="relative flex-1 p-3 sm:p-4 min-h-[118px] sm:min-h-[138px]">
                  <p className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2">
                    {cat.name}
                  </p>
                  {cat.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-3 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                  {!cat.description && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      Browse {cat.name} and related accessories.
                    </p>
                  )}
                </div>

                {/* CTA */}
                <div className="relative mx-3 mb-3 sm:mx-4 sm:mb-4 flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                  Shop now <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* All products CTA */}
        <div className="mt-6 bento-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
          <div>
            <p className="font-black text-lg">Can&apos;t find what you&apos;re looking for?</p>
            <p className="text-indigo-200 text-sm mt-0.5">Browse all products in our full catalog</p>
          </div>
          <Link
            href="/products"
            className="shrink-0 inline-flex items-center gap-2 bg-lime-400 hover:bg-lime-500 text-gray-900 font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
