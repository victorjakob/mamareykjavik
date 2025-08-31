"use client";
import { useEffect, useRef } from "react";
import { useCookieConsent } from "@/providers/CookieConsentProvider";

export function useConditionalAnalytics() {
  const { canSetAnalytics } = useCookieConsent();
  const analyticsLoaded = useRef(false);

  useEffect(() => {
    // Only load analytics if consent is given and not already loaded
    if (canSetAnalytics && !analyticsLoaded.current) {
      // Load Google Analytics
      if (typeof window !== "undefined" && window.gtag) {
        // Analytics is already available from the script tag
        analyticsLoaded.current = true;
        console.log("Analytics enabled - Google Analytics loaded");
      }
    } else if (!canSetAnalytics && analyticsLoaded.current) {
      // If consent is revoked, we should disable analytics
      analyticsLoaded.current = false;
      console.log("Analytics disabled - consent revoked");
    }
  }, [canSetAnalytics]);

  // Function to track events (only if analytics is enabled)
  const trackEvent = (action, category, label, value) => {
    if (canSetAnalytics && typeof window !== "undefined" && window.gtag) {
      window.gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  // Function to track page views (only if analytics is enabled)
  const trackPageView = (url) => {
    if (canSetAnalytics && typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "G-B028MEYKQT", {
        page_path: url,
      });
    }
  };

  return {
    isAnalyticsEnabled: canSetAnalytics,
    trackEvent,
    trackPageView,
  };
}
