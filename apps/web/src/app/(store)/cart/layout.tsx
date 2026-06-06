import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";
import { ReactNode } from "react";

export const metadata: Metadata = noIndexMetadata("Cart");

export default function CartLayout({ children }: { children: ReactNode }) {
  return children;
}
