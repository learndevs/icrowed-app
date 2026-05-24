import "server-only";
import { getOrCreateStoreSettings } from "@icrowd/database";
import {
  FALLBACK_CONTACT_INFO,
  parseStoreContactInfo,
  type StoreContactInfo,
} from "./contact-page";

/**
 * Build-safe fetch + parse of storefront contact info.
 *
 * Why this exists: the storefront/account layouts used to call
 * `getOrCreateStoreSettings()` directly. During `next build`, Next.js 16
 * prerenders every storefront page (including `"use client"` pages like
 * `/track`) and runs the layout. If Supabase is briefly unreachable from the
 * build host, the connection times out and the WHOLE BUILD ABORTS.
 *
 * Wrap the DB call so a transient connection failure degrades to default
 * contact info instead of failing the build. At request time on a healthy
 * server the real data is fetched as before.
 *
 * NOTE: lives in `*.server.ts` and imports `server-only` so it can never
 * leak the `pg` driver into a client-component bundle.
 */
export async function getStorefrontContactInfoSafe(): Promise<StoreContactInfo> {
  try {
    const settings = await getOrCreateStoreSettings();
    return parseStoreContactInfo(settings);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[contact-page.server] getOrCreateStoreSettings failed, using fallback:",
        err,
      );
    } else {
      console.warn(
        "[contact-page.server] store settings unavailable, rendering with fallback contact info",
      );
    }
    return FALLBACK_CONTACT_INFO;
  }
}
