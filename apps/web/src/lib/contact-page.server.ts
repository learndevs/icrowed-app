import "server-only";
import { getOrCreateStoreSettings } from "@icrowd/database";
import {
  FALLBACK_CONTACT_INFO,
  parseStoreContactInfo,
  type StoreContactInfo,
} from "./contact-page";

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
