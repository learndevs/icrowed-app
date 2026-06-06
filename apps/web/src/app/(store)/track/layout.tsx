import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";
import { ReactNode } from "react";

export const metadata: Metadata = noIndexMetadata("Track Order");

export default function TrackLayout({ children }: { children: ReactNode }) {
  return children;
}
