"use client";

import Script from "next/script";
import { clientEnv } from "@icrowd/env";

/**
 * GA4 gtag.js loader. Renders nothing unless NEXT_PUBLIC_GA_MEASUREMENT_ID is
 * set and the app runs in production, so dev traffic never pollutes analytics.
 */
export function GoogleAnalytics() {
  const measurementId = clientEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!measurementId || process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
