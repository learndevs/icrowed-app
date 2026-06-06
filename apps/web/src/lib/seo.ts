import type { Metadata } from "next";
import { clientEnv } from "@icrowd/env";

export const SITE_NAME = "iCrowd";
export const DEFAULT_DESCRIPTION =
  "Shop the latest smartphones, cases, chargers and accessories in Sri Lanka. Fast island-wide delivery, genuine products.";

export function siteUrl(): URL {
  return new URL(clientEnv.NEXT_PUBLIC_APP_URL);
}

export function absoluteUrl(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return siteUrl().toString();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return new URL(trimmed.startsWith("/") ? trimmed : `/${trimmed}`, siteUrl()).toString();
}

type BuildPageMetadataOpts = {
  title: string;
  /** Use when the title should not get the root `"%s | iCrowd"` template suffix. */
  absoluteTitle?: boolean;
  description?: string;
  path?: string;
  image?: string | null;
  noIndex?: boolean;
};

export function buildPageMetadata(opts: BuildPageMetadataOpts): Metadata {
  const description = opts.description ?? DEFAULT_DESCRIPTION;
  const canonicalPath = opts.path ?? "/";
  const url = absoluteUrl(canonicalPath);
  const images = opts.image ? [absoluteUrl(opts.image)] : undefined;

  const metadata: Metadata = {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: opts.title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_LK",
      type: "website",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description,
      ...(images ? { images } : {}),
    },
  };

  if (opts.noIndex) {
    metadata.robots = { index: false, follow: false };
  }

  return metadata;
}

export function noIndexMetadata(title?: string): Metadata {
  return {
    ...(title ? { title } : {}),
    robots: { index: false, follow: false },
  };
}

/** Safe JSON-LD serialization for inline script tags. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
