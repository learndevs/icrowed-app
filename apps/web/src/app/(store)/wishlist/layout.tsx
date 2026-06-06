import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";
import { ReactNode } from "react";

export const metadata: Metadata = noIndexMetadata("Wishlist");

export default function WishlistLayout({ children }: { children: ReactNode }) {
  return children;
}
