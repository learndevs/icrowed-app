"use client";

import Image from "next/image";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";
import {
  isLocalProductUploadUrl,
  normalizeProductImageUrl,
} from "@/lib/product-image-url";

export type OfferCardItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  instagramUrl: string | null;
};

export function OfferCard({
  offer,
  className,
}: Readonly<{ offer: OfferCardItem; className?: string }>) {
  const [open, setOpen] = useState(false);
  const imageSrc = offer.imageUrl ? normalizeProductImageUrl(offer.imageUrl) : null;
  const hasSocialLinks = Boolean(offer.linkUrl || offer.instagramUrl);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View offer: ${offer.title}`}
        className={cn(
          "group relative block aspect-square w-full overflow-hidden rounded-3xl shadow-[0_8px_32px_rgba(15,23,42,0.12)] transition hover:shadow-[0_12px_40px_rgba(15,23,42,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2",
          className,
        )}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={offer.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 1023px) 88vw, 33vw"
            unoptimized={isLocalProductUploadUrl(offer.imageUrl!)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 px-6">
            <span className="text-center text-sm font-medium text-zinc-500">{offer.title}</span>
          </div>
        )}
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={offer.title}
        description={offer.description ?? undefined}
        size="lg"
        footer={
          hasSocialLinks ? (
            <div className="flex flex-wrap justify-end gap-2">
              {offer.linkUrl ? (
                <a
                  href={offer.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Facebook
                </a>
              ) : null}
              {offer.instagramUrl ? (
                <a
                  href={offer.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Instagram
                </a>
              ) : null}
            </div>
          ) : undefined
        }
      >
        {imageSrc ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={offer.title}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">No image available for this offer.</p>
        )}
      </Dialog>
    </>
  );
}
