import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "iCrowed — Mobile Phones & Accessories in Sri Lanka",
    template: "%s | iCrowed",
  },
  description:
    "Shop the latest smartphones, cases, chargers and accessories in Sri Lanka. Fast island-wide delivery, genuine products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <CartProvider><WishlistProvider>{children}</WishlistProvider></CartProvider>
      </body>
    </html>
  );
}
