"use client";

import { motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { useLanguage } from "@/hooks/useLanguage";
import DualLanguageText from "@/app/components/DualLanguageText";

export default function HeroCacao() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Experience the Magic of Cacao",
      subtitle: "100% Organic Raw, Handcrafted with Love",
    },
    is: {
      title: "Upplifaðu töfra cacao",
      subtitle: "100% lífrænt hrár, handunnið með ást",
    },
  };

  const t = translations[language];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="relative h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/cacaohero.jpg')",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center text-white px-6"
        >
          <DualLanguageText
            en={t.title}
            is={t.title}
            element="h1"
            className="text-5xl tracking-tight font-extrabold leading-relaxed p-5"
          />
          <p className="mt-4 text-lg">{t.subtitle}</p>

          {/* Downward Icon for Scrolling */}
          <motion.div
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 1,
              ease: "easeOut",
            }}
            onClick={() =>
              window.scrollBy({ top: window.innerHeight, behavior: "smooth" })
            }
            className=" mt-12 inline-block cursor-pointer text-[#ff914d] hover:text-[#E68345] transition duration-300 ease-in-out"
          >
            <FaChevronDown size={48} />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
