import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getStorefrontContactInfoSafe } from "@/lib/contact-page.server";
import { ReactNode } from "react";

/** ISR: cache footer contact + shell for 60s (Next.js requires a literal here). */
export const revalidate = 60;

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
