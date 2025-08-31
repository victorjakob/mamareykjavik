"use client";
import { useEffect } from "react";
import { useCookieConsent } from "@/providers/CookieConsentProvider";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function ConditionalAnalytics() {
  const { canSetAnalytics } = useCookieConsent();

  // Only render analytics scripts if consent is given
  if (!canSetAnalytics) {
    return null;
  }

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-B028MEYKQT"
        strategy="afterInteractive"
      />
      <Script id="ga-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-B028MEYKQT');
        `}
      </Script>
      <SpeedInsights />
    </>
  );
}
