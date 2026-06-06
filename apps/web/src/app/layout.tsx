import type { Metadata } from "next";
import { Inter, Playfair_Display, Roboto } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { clientEnv } from "@icrowd/env";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_FAVICON_PATH,
  SITE_NAME,
  absoluteUrl,
  siteUrl,
} from "@/lib/seo";

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

const googleVerification = clientEnv.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "iCrowd — Mobile Phones & Accessories in Sri Lanka",
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_LK",
    siteName: SITE_NAME,
    title: "iCrowd — Mobile Phones & Accessories in Sri Lanka",
    description: DEFAULT_DESCRIPTION,
    url: absoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: "iCrowd — Mobile Phones & Accessories in Sri Lanka",
    description: DEFAULT_DESCRIPTION,
  },
  icons: {
    icon: [{ url: DEFAULT_FAVICON_PATH, type: "image/svg+xml" }],
    shortcut: [{ url: DEFAULT_FAVICON_PATH }],
    apple: [{ url: DEFAULT_FAVICON_PATH }],
  },
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
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
