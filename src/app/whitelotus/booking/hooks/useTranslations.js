import { useState, useEffect } from "react";

const translations = {
  "is-IS": {
    // Navigation
    back: "Til baka",
    continue: "Áfram",
    submitting: "Senda...",

    // Header
    title: "White Lotus // Kornhlaðan",
    subtitle: "Bókaðu viðburðinn þinn með okkur",
    footer: "Allar upplýsingar eru öruggar og verndaðar",

    // First Time (still using translations)
    firstTimeTitle: "Ertu að nýta þjónustu okkar í fyrsta skipti?",
    yes: "Já",
    no: "Nei",

    // Guest Count (still using translations)
    guestCountTitle: "Hversu margir gestir?",
    guests: "gestir",

    // Error handling
    submitError: "Villa kom upp við að senda beiðnina. Reyndu aftur.",
    errorTitle: "Villa kom upp",
    retry: "Reyna aftur",

    // Success screen
    successTitle: "Beiðnin þín hefur verið send!",
    successMessage: "Við munum hafa samband við þig innan 24 klukkustunda.",
    referenceId: "Tilvísunarnúmer:",
    backToHome: "Til baka á forsíðu",
  },
};

export function useTranslations(locale = "is-IS") {
  const [currentLocale, setCurrentLocale] = useState(locale);

  const t = (key, params = {}) => {
    let translation = translations[currentLocale]?.[key] || key;

    // Simple parameter replacement
    Object.keys(params).forEach((param) => {
      translation = translation.replace(`{{${param}}}`, params[param]);
    });

    return translation;
  };

  return { t, currentLocale, setCurrentLocale };
}
