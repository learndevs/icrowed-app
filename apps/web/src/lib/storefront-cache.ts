/**
 * ISR interval for public storefront pages (seconds).
 * Cached HTML is refreshed in the background after this TTL — avoids hitting
 * Supabase on every request while keeping catalog data reasonably fresh.
 *
 * Override on the VPS: STOREFRONT_REVALIDATE_SECONDS=120
 */
export const STOREFRONT_REVALIDATE_SECONDS = Number(
  process.env.STOREFRONT_REVALIDATE_SECONDS ?? 60,
);
