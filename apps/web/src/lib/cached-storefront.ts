import "server-only";

import { unstable_cache } from "next/cache";
import { getCheckoutDeliveryOptions, getOrCreateStoreSettings } from "@icrowd/database";

const CACHE_SECONDS = 60;

export const getCachedCheckoutDeliveryOptions = unstable_cache(
  () => getCheckoutDeliveryOptions(),
  ["storefront-checkout-delivery-options"],
  { revalidate: CACHE_SECONDS },
);

export const getCachedStoreSettings = unstable_cache(
  () => getOrCreateStoreSettings(),
  ["storefront-store-settings"],
  { revalidate: CACHE_SECONDS },
);

export const STOREFRONT_CACHE_HEADERS = {
  "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`,
};
