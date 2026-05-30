/**
 * Normalize product image URLs for Next.js <Image> and the browser.
 * Store and prefer paths like /uploads/products/{id}/file.png (same-origin).
 */

const LOCAL_PRODUCT_UPLOAD_PREFIX = "/uploads/products/";
const LOCAL_OFFER_UPLOAD_PREFIX = "/uploads/offers/";

function extractLocalUploadPathname(pathname: string): string | null {
  if (pathname.startsWith(LOCAL_PRODUCT_UPLOAD_PREFIX)) return pathname;
  if (pathname.startsWith(LOCAL_OFFER_UPLOAD_PREFIX)) return pathname;
  return null;
}

export function normalizeProductImageUrl(url: string | null | undefined): string {
  if (!url?.trim()) return "";
  const trimmed = url.trim();

  const direct = extractLocalUploadPathname(trimmed);
  if (direct) return direct;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const local = extractLocalUploadPathname(new URL(trimmed).pathname);
      if (local) return local;
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

export function isLocalProductUploadUrl(url: string): boolean {
  const normalized = normalizeProductImageUrl(url);
  return (
    normalized.startsWith(LOCAL_PRODUCT_UPLOAD_PREFIX) ||
    normalized.startsWith(LOCAL_OFFER_UPLOAD_PREFIX)
  );
}
