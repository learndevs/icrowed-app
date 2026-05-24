"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";

type Props = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string;
  disabled?: boolean;
};

export function TopSellingAddToCartButton({
  productId,
  name,
  slug,
  price,
  imageUrl,
  disabled,
}: Readonly<Props>) {
  const { addItem } = useCart();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    addItem({
      id: productId,
      productId,
      name,
      slug,
      price,
      imageUrl,
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Add ${name} to cart`}
      className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/90 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition hover:border-zinc-300 hover:shadow-md disabled:opacity-40 md:h-10 md:w-10 lg:h-11 lg:w-11"
    >
      <Image
        src="/home/payment/cart-bag.png"
        alt=""
        width={20}
        height={20}
        className="h-4 w-4 opacity-90 md:h-5 md:w-5"
      />
    </button>
  );
}
