import type { Metadata } from "next";
import { Inter, Playfair_Display, Roboto } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-inter",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
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
    <html lang="en" className={`h-full ${inter.variable} ${roboto.variable} ${playfair.variable}`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <CartProvider><WishlistProvider>{children}</WishlistProvider></CartProvider>
      </body>
    </html>
  );
}
