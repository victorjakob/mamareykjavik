"use client";

import { useLanguage } from "@/hooks/useLanguage";

export default function DualLanguageText({
  en,
  is,
  element = "p",
  className = "",
  ...props
}) {
  const { language } = useLanguage();
  const Element = element;

  return (
    <>
      {/* English version */}
      <Element
        className={`${className} ${language === "en" ? "" : "hidden"}`}
        aria-hidden={language !== "en"}
        inert={language !== "en"}
        {...props}
      >
        {en}
      </Element>

      {/* Icelandic version */}
      <Element
        className={`${className} ${language === "is" ? "" : "hidden"}`}
        aria-hidden={language !== "is"}
        inert={language !== "is"}
        {...props}
      >
        {is}
      </Element>
    </>
  );
}
