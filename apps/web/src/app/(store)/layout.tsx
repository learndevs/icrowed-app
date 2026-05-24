import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getStorefrontContactInfoSafe } from "@/lib/contact-page.server";
import { STOREFRONT_REVALIDATE_SECONDS } from "@/lib/storefront-cache";
import { ReactNode } from "react";

export const revalidate = STOREFRONT_REVALIDATE_SECONDS;

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
