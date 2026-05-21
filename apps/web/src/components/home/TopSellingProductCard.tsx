import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { TopSellingAddToCartButton } from "./TopSellingAddToCartButton";

export type TopSellingProductData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  imageUrl?: string;
  stock: number;
  soldCount?: number;
};

/** Deterministic LKR formatting — avoids SSR/client `toLocaleString` mismatches. */
function formatLkrAmount(amount: number): string {
  const whole = Math.round(amount).toString();
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return withCommas;
}

function discountPercent(price: number, comparePrice?: number) {
  if (!comparePrice || comparePrice <= price) return null;
  return Math.round((1 - price / comparePrice) * 100);
}

export function TopSellingProductCard({
  product,
}: Readonly<{ product: TopSellingProductData }>) {
  const discount = discountPercent(product.price, product.comparePrice);
  const sold = product.soldCount ?? 307;
  const isOOS = product.stock === 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full w-full min-w-0 max-w-full flex-col rounded-xl bg-[#F2F2F2] p-2 shadow-[0_4px_20px_rgba(15,23,42,0.07)] transition-shadow hover:shadow-[0_6px_24px_rgba(15,23,42,0.1)] md:rounded-2xl md:p-2.5"
    >
      {/* White image well */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-white md:rounded-xl">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain object-center p-4 transition-transform duration-300 group-hover:scale-[1.02] md:p-5"
            sizes="(max-width: 767px) 46vw, 18vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-300 text-xs">
            No image
          </div>
        )}

        {/* Visa + Mastercard — position unchanged */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
          <Image
            src="/home/payment/visa.png"
            alt="Visa"
            width={32}
            height={11}
            className="h-[10px] w-auto object-contain md:h-[11px]"
          />
          <Image
            src="/home/payment/mastercard.png"
            alt="Mastercard"
            width={22}
            height={14}
            className="h-[12px] w-auto object-contain md:h-[14px]"
          />
        </div>
      </div>

      {/* Details */}
      <div className="relative min-h-[6.75rem] px-1 pt-2.5 pb-1 md:min-h-[7rem] md:px-1.5 md:pt-3">
        <div className="flex items-start justify-between gap-1.5 pr-10 md:gap-2 md:pr-11">
          <h3 className="text-[13px] font-bold leading-tight text-zinc-900 line-clamp-2 md:text-sm">
            {product.name}
          </h3>
          {discount != null && discount > 0 && (
            <span className="shrink-0 rounded-md bg-[#D4EDDA] px-1.5 py-0.5 text-[9px] font-bold leading-none text-[#1B7A3D] md:rounded-lg md:px-2 md:py-1 md:text-[10px]">
              {discount}% OFF
            </span>
          )}
        </div>

        <p className="mt-1.5 leading-none text-zinc-900 md:mt-2">
          <span className="text-xs font-medium md:text-sm">LKR </span>
          <span className="text-base font-black tracking-tight md:text-lg lg:text-xl">
            {formatLkrAmount(product.price)}
          </span>
        </p>

        <div className="mt-1.5 flex items-center gap-1 md:mt-2 md:gap-1.5">
          <div className="flex items-center gap-0.5" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-3 w-3 fill-[#F5B301] text-[#F5B301] md:h-3.5 md:w-3.5"
                strokeWidth={0}
              />
            ))}
          </div>
          <span className="text-[10px] font-medium text-zinc-500 md:text-xs">{sold} sold</span>
        </div>

        <TopSellingAddToCartButton
          productId={product.id}
          name={product.name}
          slug={product.slug}
          price={product.price}
          imageUrl={product.imageUrl}
          disabled={isOOS}
        />
      </div>
    </Link>
  );
}
