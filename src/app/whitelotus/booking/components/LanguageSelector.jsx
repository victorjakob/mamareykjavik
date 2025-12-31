"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LanguageSelector({ onLanguageSelected }) {
  const { language, setLanguage, isLoaded } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(null);
  const router = useRouter();

  // Check URL hash on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1); // Remove the #
      if (hash === "is" || hash === "en") {
        setLanguage(hash);
        setSelectedLang(hash);
        if (onLanguageSelected) {
          onLanguageSelected(hash);
        }
      }
    }
  }, []); // Only run on mount

  // Initialize with current language if already set
  useEffect(() => {
    if (isLoaded && language) {
      setSelectedLang(language);
      if (onLanguageSelected) {
        onLanguageSelected(language);
      }
    }
  }, [isLoaded, language, onLanguageSelected]);

  const handleSelect = (lang) => {
    setSelectedLang(lang);
    setLanguage(lang);
    
    // Update URL hash
    if (typeof window !== "undefined") {
      window.location.hash = lang;
    }
    
    if (onLanguageSelected) {
      onLanguageSelected(lang);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col items-center gap-4 mb-8"
    >
      <p className="text-sm font-light text-[#fefff5]/80 mb-2">
        Veldu tungumál / Select language
      </p>
      <div className="flex gap-4">
        <motion.button
          onClick={() => handleSelect("is")}
          className={`
            px-6 py-3 rounded-full border transition-all duration-300
            ${
              selectedLang === "is"
                ? "border-[#a77d3b] bg-[#a77d3b]/20 text-[#fefff5]"
                : "border-[#a77d3b]/40 text-[#fefff5]/60 hover:border-[#a77d3b]/60"
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="font-light">Íslenska</span>
        </motion.button>
        <motion.button
          onClick={() => handleSelect("en")}
          className={`
            px-6 py-3 rounded-full border transition-all duration-300
            ${
              selectedLang === "en"
                ? "border-[#a77d3b] bg-[#a77d3b]/20 text-[#fefff5]"
                : "border-[#a77d3b]/40 text-[#fefff5]/60 hover:border-[#a77d3b]/60"
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="font-light">English</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

