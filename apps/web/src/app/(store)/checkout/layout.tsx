import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";
import { ReactNode } from "react";

export const metadata: Metadata = noIndexMetadata("Checkout");

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return <div className="font-inter min-h-full checkout-flow-bg">{children}</div>;
}
