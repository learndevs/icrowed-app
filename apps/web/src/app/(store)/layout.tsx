import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getStorefrontContactInfoSafe } from "@/lib/contact-page.server";
import { getOrCreateStoreSettings } from "@icrowd/database";
import { queryStorefront } from "@/lib/storefront-query";
import { DEFAULT_FAVICON_PATH, SITE_NAME, absoluteUrl } from "@/lib/seo";
import { ReactNode } from "react";

/** ISR: cache footer contact + shell for 60s (Next.js requires a literal here). */
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await queryStorefront("store-seo", () => getOrCreateStoreSettings());
    const siteName = settings.storeName?.trim() || SITE_NAME;

    return {
      openGraph: {
        siteName,
        ...(settings.logoUrl
          ? { images: [{ url: absoluteUrl(settings.logoUrl) }] }
          : {}),
      },
      icons: {
        icon: [
          {
            url: absoluteUrl(settings.faviconUrl?.trim() || DEFAULT_FAVICON_PATH),
            type: settings.faviconUrl?.trim()?.endsWith(".svg")
              ? "image/svg+xml"
              : undefined,
          },
        ],
        shortcut: [
          { url: absoluteUrl(settings.faviconUrl?.trim() || DEFAULT_FAVICON_PATH) },
        ],
        apple: [
          { url: absoluteUrl(settings.faviconUrl?.trim() || DEFAULT_FAVICON_PATH) },
        ],
      },
    };
  } catch {
    return {};
  }
}

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const contactInfo = await getStorefrontContactInfoSafe();

  return (
    <>
      <Header />
      <main className="flex-1 min-h-0">{children}</main>
      <Footer contactInfo={contactInfo} />
    </>
  );
}
