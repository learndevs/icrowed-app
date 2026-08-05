import Image from "next/image";
import Link from "next/link";

export type CategoryShowcaseItem = {
  slug: string;
  /** Link target, e.g. `/categories/smartphones` */
  href: string;
  /** Local `/…` or absolute image URL (stored in DB `image_url`) */
  imageSrc: string;
  /** Category display name */
  name: string;
};

function showcaseImageSrc(
  slug: string,
  imageUrl: string | null | undefined,
  updatedAt?: Date | string | null,
): string {
  const u = imageUrl?.trim();
  const base = u || `/home/categories/${slug}.png`;
  if (base.startsWith("http")) return base;

  const version = updatedAt ? new Date(updatedAt).getTime() : null;
  if (!version || Number.isNaN(version)) return base;

  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}v=${version}`;
}

/** Map DB category row → grid item (paths under `public/` resolve from `image_url`). */
export function categoryRowToShowcaseItem(cat: {
  slug: string;
  name: string;
  imageUrl: string | null;
  updatedAt?: Date | string | null;
}): CategoryShowcaseItem {
  return {
    slug: cat.slug,
    href: `/categories/${encodeURIComponent(cat.slug)}`,
    imageSrc: showcaseImageSrc(cat.slug, cat.imageUrl, cat.updatedAt),
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
          className="group relative flex flex-col items-center overflow-hidden rounded-[10px] bg-[#E6E6E6] p-6 sm:p-8 text-center transition-[box-shadow,transform] duration-300 hover:shadow-[0_0_28px_rgba(255,255,255,0.85),0_0_56px_rgba(147,197,253,0.45)] hover:-translate-y-0.5"
        >
          {/* Soft glow bloom on hover — CSS only, no assets */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 50% 58%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 35%, rgba(255,255,255,0) 70%)",
            }}
          />

          <p className="relative z-[1] mb-5 sm:mb-7 w-full text-sm sm:text-base font-bold uppercase tracking-wide text-[#333333] leading-snug line-clamp-2">
            {cat.name}
          </p>

          <div className="relative z-[1] w-full min-h-[9rem] sm:min-h-[11rem] lg:min-h-[12.5rem] flex-1">
            <Image
              src={cat.imageSrc}
              alt={cat.name}
              fill
              unoptimized
              className="object-contain object-center p-1 sm:p-2 transition-transform duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 45vw, 30vw"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
