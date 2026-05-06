import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Smartphone } from "lucide-react";

type NewArrivalItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string;
  brand?: string;
};

interface NewArrivalsSectionProps {
  items: NewArrivalItem[];
}

function formatPrice(p: number) {
  return "LKR " + p.toLocaleString("en-LK");
}

export function NewArrivalsSection({ items }: NewArrivalsSectionProps) {
  return (
    <section className="px-3 sm:px-5 lg:px-8 pt-2 pb-4 max-w-[1400px] mx-auto">
      <div className="rounded-[1.75rem] border border-white/50 bg-white/40 p-4 sm:p-5 backdrop-blur-xl shadow-[0_16px_34px_rgba(15,23,42,0.1)]">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-black">New Arrivals</h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">Latest products added to the store</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-black hover:text-gray-700 transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/60 p-3 backdrop-blur-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
            >
              <div className="pointer-events-none absolute -top-14 -right-14 h-28 w-28 rounded-full bg-gray-100/90 blur-2xl" />
              <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Smartphone className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>
              <p className="truncate text-[11px] font-medium text-gray-500">{item.brand ?? "Latest Collection"}</p>
              <p className="line-clamp-2 text-sm font-bold leading-snug text-black">{item.name}</p>
              <p className="mt-1 text-sm font-black text-black">{formatPrice(item.price)}</p>
            </Link>
          ))}
          {items.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-gray-500">No new arrivals available right now.</p>
          )}
        </div>
      </div>
    </section>
  );
}
