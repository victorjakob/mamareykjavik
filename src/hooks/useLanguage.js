"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Cookies from "js-cookie";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check URL hash first (takes precedence)
    let savedLanguage = null;
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1); // Remove the #
      if (hash === "is" || hash === "en") {
        savedLanguage = hash;
      }
    }
    
    // If no hash, get language from cookie, default to English
    if (!savedLanguage) {
      savedLanguage = Cookies.get("language");
      if (!savedLanguage) {
        // Initialize cookie if it doesn't exist
        savedLanguage = "en";
        Cookies.set("language", "en", { expires: 365 });
      }
    }
    
    setLanguageState(savedLanguage);
    Cookies.set("language", savedLanguage, { expires: 365 });
    setIsLoaded(true);
  }, []);

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
