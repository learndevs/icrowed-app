import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  { name: "Smartphones", slug: "smartphones", emoji: "📱", count: 120 },
  { name: "Cases & Covers", slug: "cases-covers", emoji: "🛡️", count: 80 },
  { name: "Chargers", slug: "chargers", emoji: "🔌", count: 45 },
  { name: "Earbuds & Audio", slug: "earbuds-audio", emoji: "🎧", count: 60 },
  { name: "Screen Protectors", slug: "screen-protectors", emoji: "🪟", count: 35 },
  { name: "Power Banks", slug: "power-banks", emoji: "🔋", count: 28 },
  { name: "Cables & Adapters", slug: "cables-adapters", emoji: "🔗", count: 52 },
  { name: "Smart Watches", slug: "smart-watches", emoji: "⌚", count: 30 },
];

export default function FeaturedCategories() {
  return (
    <section className="py-14 bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">Shop by Category</h2>
            <p className="text-[var(--muted)] text-sm mt-1">Find exactly what you&apos;re looking for</p>
          </div>
          <Link
            href="/categories"
            className="hidden sm:flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline font-medium"
          >
            All categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-[var(--border)] hover:border-[var(--color-primary)] hover:shadow-md transition-all duration-200 text-center"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs font-medium text-[var(--foreground)] group-hover:text-[var(--color-primary)] transition-colors leading-tight">
                {cat.name}
              </span>
              <span className="text-[10px] text-[var(--muted)]">{cat.count} items</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
