import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getOrCreateStoreSettings } from "@icrowd/database";
import { parseStoreContactInfo } from "@/lib/contact-page";
import { ReactNode } from "react";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const settings = await getOrCreateStoreSettings();
  const contactInfo = parseStoreContactInfo(settings);

  return (
    <>
      <Header />
      <main className="flex-1 min-h-0">{children}</main>
      <Footer contactInfo={contactInfo} />
    </>
  );
}
