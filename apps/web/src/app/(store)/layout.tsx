import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ReactNode } from "react";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 min-h-0">{children}</main>
      <Footer />
    </>
  );
}
