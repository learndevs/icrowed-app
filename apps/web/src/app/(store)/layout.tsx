import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getStorefrontContactInfoSafe } from "@/lib/contact-page.server";
import { ReactNode } from "react";

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
