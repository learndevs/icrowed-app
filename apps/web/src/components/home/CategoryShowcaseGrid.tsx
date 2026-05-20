import Image from "next/image";
import Link from "next/link";

export type CategoryShowcaseItem = {
  slug: string;
  /** Link target, e.g. `/products?category=smartphones` */
  href: string;
  /** Local `/…` or absolute image URL (stored in DB `image_url`) */
  imageSrc: string;
  /** Category display name */
  name: string;
};

function showcaseImageSrc(slug: string, imageUrl: string | null | undefined): string {
  const u = imageUrl?.trim();
  if (u) return u;
  return `/home/categories/${slug}.png`;
}

/** Map DB category row → grid item (paths under `public/` resolve from `image_url`). */
export function categoryRowToShowcaseItem(cat: {
  slug: string;
  name: string;
  imageUrl: string | null;
}): CategoryShowcaseItem {
  return {
    slug: cat.slug,
    href: `/products?category=${encodeURIComponent(cat.slug)}`,
    imageSrc: showcaseImageSrc(cat.slug, cat.imageUrl),
    name: cat.name,
  };
}

/**
 * Storefront category tiles — glass card, image well, category name only.
 */
export function CategoryShowcaseGrid({ items }: Readonly<{ items: CategoryShowcaseItem[] }>) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((cat) => (
        <Link
          key={cat.slug}
          href={cat.href}
          className="group relative overflow-hidden rounded-2xl sm:rounded-[1.5rem] border border-white/70 bg-white/55 backdrop-blur-xl shadow-[0_10px_26px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.16)]"
        >
          <div className="flex flex-col h-full p-3 sm:p-4 gap-3 sm:gap-4">
            <div className="relative w-full min-h-[12rem] sm:min-h-[14rem] lg:min-h-[16rem] shrink-0 overflow-hidden rounded-xl sm:rounded-2xl bg-gray-100/80 backdrop-blur-md">
              <Image
                src={cat.imageSrc}
                alt={cat.name}
                fill
                unoptimized={cat.imageSrc.startsWith("http")}
                className="object-contain object-top p-2 sm:p-3 transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 45vw, 30vw"
              />
            </div>

            <div className="min-w-0 w-full shrink-0 text-center pb-0.5">
              <p className="text-sm sm:text-base font-black text-gray-900 leading-snug line-clamp-2">
                {cat.name}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
