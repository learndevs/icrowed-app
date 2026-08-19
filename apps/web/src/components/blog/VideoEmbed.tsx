"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { getVideoEmbedUrl, getVideoThumbnail } from "@/lib/video-embed";
import { normalizeProductImageUrl } from "@/lib/product-image-url";

interface VideoEmbedProps {
  url: string;
  title?: string;
}

export function VideoEmbed({ url, title }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = getVideoEmbedUrl(url);
  const thumb = getVideoThumbnail(url);

  if (!embedUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700 hover:bg-sky-100"
      >
        Watch video →
      </a>
    );
  }

  if (playing) {
    return (
      <div className="overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.10)]">
        <div className="relative aspect-video bg-black">
          <iframe
            src={`${embedUrl}?autoplay=1`}
            title={title ?? "Video"}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block w-full overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.10)]"
      aria-label={title ? `Play ${title}` : "Play video"}
    >
      <div className="relative aspect-video bg-gradient-to-br from-sky-100 to-sky-200">
        {thumb ? (
          <Image
            src={thumb}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        ) : null}
        <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg transition group-hover:scale-105">
            <Play className="ml-1 h-6 w-6 fill-zinc-900 text-zinc-900" />
          </span>
        </div>
      </div>
      {title ? (
        <p className="bg-white px-4 py-3 text-left text-sm font-medium text-zinc-800">{title}</p>
      ) : null}
    </button>
  );
}
