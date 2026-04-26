"use client";

import { useState } from "react";
import Image from "next/image";
import { Smartphone } from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

interface Props {
  images: ProductImage[];
  productName: string;
  gradient: string;
  discount: number | null;
  brand: string;
}

export function ProductImages({ images, productName, gradient, discount, brand }: Props) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = sorted[selectedIdx];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className={`bento-card aspect-square relative bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
      >
        {selected?.url ? (
          <Image
            src={selected.url}
            alt={selected.altText ?? productName}
            fill
            className="object-contain p-4"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          <Smartphone className="w-32 h-32 text-white/60" />
        )}
        {discount && (
          <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            -{discount}% OFF
          </span>
        )}
        <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/30">
          {brand}
        </span>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {sorted.length > 0
          ? sorted.slice(0, 4).map((img, i) => (
              <button
                key={img.id}
                onClick={() => setSelectedIdx(i)}
                className={`bento-card aspect-square flex items-center justify-center overflow-hidden transition-opacity ${
                  i === selectedIdx ? "ring-2 ring-gray-900 ring-offset-2" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText ?? productName}
                  width={80}
                  height={80}
                  className="object-contain w-full h-full p-1"
                />
              </button>
            ))
          : [0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`bento-card aspect-square flex items-center justify-center ${i === 0 ? "ring-2 ring-gray-900 ring-offset-2" : "opacity-30"}`}
              >
                <Smartphone className="w-7 h-7 text-gray-400" />
              </div>
            ))}
      </div>
    </div>
  );
}
