import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getStorefrontContactInfoSafe } from "@/lib/contact-page.server";
import { noIndexMetadata } from "@/lib/seo";
import { ReactNode } from "react";

export const revalidate = 60;
export const metadata: Metadata = noIndexMetadata("Account");

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const contactInfo = await getStorefrontContactInfoSafe();

  return (
    <>
      <Header />
      <main className="flex-1 min-h-0">{children}</main>
      <Footer contactInfo={contactInfo} />
    </>
  );
}
