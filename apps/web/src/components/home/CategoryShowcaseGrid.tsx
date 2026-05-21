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
 * Storefront category tiles — flat gray card, uppercase title, centered product image.
 */
export function CategoryShowcaseGrid({ items }: Readonly<{ items: CategoryShowcaseItem[] }>) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((cat) => (
        <Link
          key={cat.slug}
          href={cat.href}
          className="group flex flex-col items-center rounded-[10px] bg-[#E6E6E6] p-6 sm:p-8 text-center transition-opacity hover:opacity-95"
        >
          <p className="mb-5 sm:mb-7 w-full text-sm sm:text-base font-bold uppercase tracking-wide text-[#333333] leading-snug line-clamp-2">
            {cat.name}
          </p>

          <div className="relative w-full min-h-[9rem] sm:min-h-[11rem] lg:min-h-[12.5rem] flex-1">
            <Image
              src={cat.imageSrc}
              alt={cat.name}
              fill
              unoptimized={cat.imageSrc.startsWith("http")}
              className="object-contain object-center p-1 sm:p-2 transition-transform duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 45vw, 30vw"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
