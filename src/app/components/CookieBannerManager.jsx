"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCookieConsent } from "@/providers/CookieConsentProvider";
import CookieConsentBanner from "./CookieConsentBanner";

export default function CookieBannerManager() {
  const pathname = usePathname();
  const { checkShouldShowBanner } = useCookieConsent();

  useEffect(() => {
    checkShouldShowBanner(pathname);
  }, [pathname, checkShouldShowBanner]);

  return <CookieConsentBanner />;
}
