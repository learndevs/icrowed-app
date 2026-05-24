"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Smartphone, ChevronLeft, ChevronRight } from "lucide-react";

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
}

export function ProductImages({ images, productName, gradient }: Readonly<Props>) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = sorted[selectedIdx];
  const total = sorted.length;

  const prev = useCallback(() => {
    setSelectedIdx((i) => (i === 0 ? total - 1 : i - 1));
  }, [total]);

  const next = useCallback(() => {
    setSelectedIdx((i) => (i === total - 1 ? 0 : i + 1));
  }, [total]);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image with carousel controls */}
      <div
        className={`bento-card relative bg-linear-to-br ${gradient} flex items-center justify-center overflow-hidden`}
        style={{ aspectRatio: "1 / 1" }}
      >
        {selected?.url ? (
          <Image
            src={selected.url}
            alt={selected.altText ?? productName}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 1024px) 90vw, 45vw"
            priority
          />
        ) : (
          <Smartphone className="w-28 h-28 sm:w-36 sm:h-36 text-white/60" />
        )}

        {/* Carousel arrows — only when multiple images */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all duration-150"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all duration-150"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {sorted.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setSelectedIdx(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`rounded-full transition-all duration-200 ${
                  i === selectedIdx
                    ? "w-5 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip — bottom */}
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelectedIdx(i)}
              className={`shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-xl border-2 flex items-center justify-center overflow-hidden bg-white transition-all duration-150 ${
                i === selectedIdx
                  ? "border-gray-900 shadow-sm"
                  : "border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? productName}
                width={72}
                height={72}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}

      {/* Placeholder thumbnails when no images */}
      {total === 0 && (
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center ${
                i === 0 ? "border-gray-900" : "border-gray-200 opacity-30"
              }`}
            >
              <Smartphone className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
