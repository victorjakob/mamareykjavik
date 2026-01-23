"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Cookies from "js-cookie";

const LanguageContext = createContext();

export function LanguageProvider({ children, initialLanguage = "en" }) {
  // URL/server-provided locale is the source of truth for SEO pages.
  const [language, setLanguageState] = useState(initialLanguage);
  const [isLoaded, setIsLoaded] = useState(true);

  // Keep state in sync with server-provided locale on navigation.
  useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      setLanguageState(initialLanguage);
    }
    setIsLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLanguage]);

  // Persist for UX (non-SEO), but do not *derive* language from cookie.
  useEffect(() => {
    Cookies.set("language", language, { expires: 365 });
  }, [language]);

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "is" : "en";
    setLanguageState(newLanguage);
    // Save to cookie with 1 year expiration
    Cookies.set("language", newLanguage, { expires: 365 });
  };

  const setLanguage = (newLanguage) => {
    setLanguageState(newLanguage);
    Cookies.set("language", newLanguage, { expires: 365 });
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage,
        setLanguage,
        isEnglish: language === "en",
        isIcelandic: language === "is",
        isLoaded,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
