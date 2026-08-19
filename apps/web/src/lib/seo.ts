import type { Metadata } from "next";
import { clientEnv } from "@icrowd/env";

export const SITE_NAME = "iCrowd";
/** Square PNG (≥48px) — preferred by Google Search favicon crawl. */
export const DEFAULT_FAVICON_PATH = "/icrowd-favicon.png";
/** SVG brand mark — sharp in browser tabs. */
export const DEFAULT_FAVICON_SVG_PATH = "/icrowd-logo.svg";
export const DEFAULT_APPLE_TOUCH_ICON_PATH = "/apple-touch-icon.png";
export const DEFAULT_TITLE =
  "iCrowd — iPhone Price in Sri Lanka | Apple, Anker & DJI";
export const DEFAULT_DESCRIPTION =
  "iPhone price in Sri Lanka at iCrowd — iPhone 17, 17 Pro Max, 16 Pro Max and more. Genuine Apple, Anker and DJI with island-wide delivery and an iPhone shop in Kandy.";
export const DEFAULT_KEYWORDS = [
  "iPhone price in Sri Lanka",
  "iPhone 17 Pro Max price in Sri Lanka",
  "iPhone 16 Pro Max price in Sri Lanka",
  "iPhone 17 price Sri Lanka",
  "phone price in Sri Lanka",
  "iPhone shop Kandy",
  "buy iPhone Kandy",
  "Apple products Sri Lanka",
  "Anker Sri Lanka",
  "Anker earbuds Sri Lanka",
  "AirPods Pro price Sri Lanka",
  "power banks Sri Lanka",
  "UGREEN power bank price in Sri Lanka",
  "UGREEN charger Sri Lanka",
  "DJI drone Sri Lanka",
  "DJI Mini price Sri Lanka",
  "phone accessories Sri Lanka",
  "iCrowd",
];

export function siteUrl(): URL {
  return new URL(clientEnv.NEXT_PUBLIC_APP_URL);
}

export function absoluteUrl(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return siteUrl().toString();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return new URL(trimmed.startsWith("/") ? trimmed : `/${trimmed}`, siteUrl()).toString();
}

function iconMimeType(url: string): string | undefined {
  const lower = url.toLowerCase();
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".ico")) return "image/x-icon";
  if (lower.endsWith(".webp")) return "image/webp";
  return undefined;
}

/** Default / overridden favicon set for `<link rel="icon">` metadata. */
export function buildIconsMetadata(faviconUrl?: string | null): NonNullable<Metadata["icons"]> {
  const custom = faviconUrl?.trim();
  if (custom) {
    const url = absoluteUrl(custom);
    const type = iconMimeType(custom);
    return {
      icon: [{ url, ...(type ? { type } : {}) }],
      shortcut: [{ url }],
      apple: [{ url }],
    };
  }

  return {
    icon: [
      {
        url: absoluteUrl(DEFAULT_FAVICON_PATH),
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: absoluteUrl("/icrowd-favicon-96.png"),
        sizes: "96x96",
        type: "image/png",
      },
      {
        url: absoluteUrl(DEFAULT_FAVICON_SVG_PATH),
        type: "image/svg+xml",
      },
    ],
    shortcut: [{ url: absoluteUrl(DEFAULT_FAVICON_PATH) }],
    apple: [
      {
        url: absoluteUrl(DEFAULT_APPLE_TOUCH_ICON_PATH),
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
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

/** Format LKR for meta descriptions (no currency symbol quirks in SERP snippets). */
export function formatLkrForSeo(amount: number): string {
  return `LKR ${Math.round(amount).toLocaleString("en-LK")}`;
}

/** Build product title/description for Sri Lanka commercial intent. */
export function buildProductSeoCopy(opts: {
  name: string;
  brandName?: string | null;
  categoryName?: string | null;
  price: number;
  shortDescription?: string | null;
  description?: string | null;
}): { title: string; description: string } {
  const title = `${opts.name} Price in Sri Lanka`;
  const priceLabel = formatLkrForSeo(opts.price);
  const brandBit = opts.brandName?.trim() ? `${opts.brandName.trim()} ` : "";
  const categoryBit = opts.categoryName?.trim()
    ? ` ${opts.categoryName.trim().toLowerCase()}`
    : " product";
  const base =
    opts.shortDescription?.trim() ||
    opts.description?.trim().slice(0, 120) ||
    `Buy genuine ${brandBit}${opts.name}${categoryBit} at iCrowd.`;
  const description = `${base} ${priceLabel}. Island-wide delivery · Buy in Kandy or pickup in Kottawa & Matara.`
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 320);
  return { title, description };
}

/** FAQPage JSON-LD for a small on-page Q&A block (People-Also-Ask style). */
export function buildFaqJsonLd(faqs: { question: string; answer: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** Collect absolute social profile URLs for Organization/LocalBusiness sameAs. */
export function socialSameAs(social?: {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  whatsapp?: string;
} | null): string[] {
  if (!social) return [];
  const urls = [
    social.facebook,
    social.instagram,
    social.twitter,
    social.tiktok,
    social.youtube,
  ];
  return urls
    .map((u) => u?.trim())
    .filter((u): u is string => Boolean(u && /^https?:\/\//i.test(u)));
}
