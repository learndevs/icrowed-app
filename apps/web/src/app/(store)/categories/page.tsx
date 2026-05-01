import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Tag } from "lucide-react";
import { getCategories } from "@icrowed/database/queries";

export const metadata: Metadata = { title: "Categories | iCrowed" };

const CATEGORY_GRADIENTS = [
  "from-sky-400 to-blue-500",
  "from-teal-400 to-emerald-500",
  "from-orange-400 to-amber-500",
  "from-pink-400 to-rose-500",
  "from-violet-400 to-purple-500",
  "from-indigo-400 to-blue-600",
  "from-green-400 to-teal-500",
  "from-red-400 to-rose-600",
] as const;

function categoryGradient(id: string) {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return CATEGORY_GRADIENTS[hash % CATEGORY_GRADIENTS.length];
}

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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="bento-card group p-5 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Image or gradient placeholder */}
                <div className={`w-full aspect-video rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br ${categoryGradient(cat.id)}`}>
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      width={300}
                      height={169}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Tag className="w-8 h-8 text-white/70" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm leading-snug">{cat.name}</p>
                  {cat.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{cat.description}</p>
                  )}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600">
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
