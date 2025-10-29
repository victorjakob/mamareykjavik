"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Cookies from "js-cookie";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Get language from cookie on mount, default to English
    let savedLanguage = Cookies.get("language");
    if (!savedLanguage) {
      // Initialize cookie if it doesn't exist
      savedLanguage = "en";
      Cookies.set("language", "en", { expires: 365 });
    }
    setLanguage(savedLanguage);
    setIsLoaded(true);
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "is" : "en";
    setLanguage(newLanguage);
    // Save to cookie with 1 year expiration
    Cookies.set("language", newLanguage, { expires: 365 });
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage,
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
