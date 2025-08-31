"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import Cookies from "js-cookie";

const CookieConsentContext = createContext();

const COOKIE_CONSENT_KEY = "mama_cookie_consent";
const COOKIE_PREFERENCES_KEY = "mama_cookie_preferences";

export function CookieConsentProvider({ children }) {
  const [hasConsented, setHasConsented] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    analytics: false,
    functional: false,
  });
  const [showBanner, setShowBanner] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const savedConsent = Cookies.get(COOKIE_CONSENT_KEY);
    const savedPreferences = Cookies.get(COOKIE_PREFERENCES_KEY);

    if (savedConsent && savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences);
        setPreferences(parsedPreferences);
        setHasConsented(true);
      } catch (error) {
        console.error("Error parsing cookie preferences:", error);
        // Reset to defaults if parsing fails
        Cookies.remove(COOKIE_CONSENT_KEY);
        Cookies.remove(COOKIE_PREFERENCES_KEY);
        setHasConsented(false);
        setPreferences({
          essential: true,
          analytics: false,
          functional: false,
        });
      }
    }
  }, []);

  const updatePreferences = (newPreferences) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);

    // Save to cookies
    Cookies.set(COOKIE_PREFERENCES_KEY, JSON.stringify(updatedPreferences), {
      expires: 365,
      sameSite: "strict",
    });

    // Mark as consented
    Cookies.set(COOKIE_CONSENT_KEY, "true", {
      expires: 365,
      sameSite: "strict",
    });

    setHasConsented(true);
    setShowBanner(false);
  };

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      functional: true,
    };
    updatePreferences(allAccepted);
  };

  const rejectAll = () => {
    const onlyEssential = {
      essential: true,
      analytics: false,
      functional: false,
    };
    updatePreferences(onlyEssential);
  };

  const resetPreferences = () => {
    Cookies.remove(COOKIE_CONSENT_KEY);
    Cookies.remove(COOKIE_PREFERENCES_KEY);
    setHasConsented(false);
    setPreferences({
      essential: true,
      analytics: false,
      functional: false,
    });
    setShowBanner(true);
  };

  // Check if banner should be shown based on current pathname
  const checkShouldShowBanner = useCallback((pathname) => {
    // Don't show banner on home page
    if (pathname === "/") {
      setShowBanner(false);
      return;
    }

    // Check if user has already consented by looking at actual cookies
    const savedConsent = Cookies.get(COOKIE_CONSENT_KEY);
    const savedPreferences = Cookies.get(COOKIE_PREFERENCES_KEY);

    if (savedConsent && savedPreferences) {
      // User has already consented, don't show banner
      setShowBanner(false);
      return;
    }

    // Show banner if no consent given
    setShowBanner(true);
  }, []);

  // Check if specific cookie types are allowed
  const canSetCookie = (type) => {
    if (type === "essential") return true;
    return hasConsented && preferences[type];
  };

  // Check if analytics cookies are allowed
  const canSetAnalytics = () => canSetCookie("analytics");

  // Check if functional cookies are allowed
  const canSetFunctional = () => canSetCookie("functional");

  const value = {
    hasConsented,
    preferences,
    showBanner,
    canSetCookie,
    canSetAnalytics,
    canSetFunctional,
    updatePreferences,
    acceptAll,
    rejectAll,
    resetPreferences,
    setShowBanner,
    checkShouldShowBanner,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error(
      "useCookieConsent must be used within a CookieConsentProvider"
    );
  }
  return context;
}
