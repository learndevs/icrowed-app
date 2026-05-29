/**
 * Normalize product image URLs for Next.js <Image> and the browser.
 * Store and prefer paths like /uploads/products/{id}/file.png (same-origin).
 */

const LOCAL_UPLOAD_PREFIX = "/uploads/products/";

export function normalizeProductImageUrl(url: string | null | undefined): string {
  if (!url?.trim()) return "";
  const trimmed = url.trim();

  if (trimmed.startsWith(LOCAL_UPLOAD_PREFIX)) return trimmed;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const pathname = new URL(trimmed).pathname;
      if (pathname.startsWith(LOCAL_UPLOAD_PREFIX)) return pathname;
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

export function isLocalProductUploadUrl(url: string): boolean {
  return normalizeProductImageUrl(url).startsWith(LOCAL_UPLOAD_PREFIX);
}
