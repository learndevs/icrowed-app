import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";
import { ReactNode } from "react";

export const metadata: Metadata = noIndexMetadata();

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
