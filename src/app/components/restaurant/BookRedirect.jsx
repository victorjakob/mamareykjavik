"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

export default function BookRedirect() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Book Your Table at Mama Reykjavik",
      description:
        "To book a table at Mama Reykjavik, please use our official reservation system through the link below. We look forward to welcoming you!",
      buttonText: "Book a Table",
    },
    is: {
      title: "Bókaðu borð á Mama Reykjavík",
      description:
        "Til að bóka borð á Mama Reykjavík, vinsamlegast notaðu bókunarkerfið okkar í gegnum hlekkinn hér að neðan. Við hlökkum til að sjá þig!",
      buttonText: "Bóka borð",
    },
  };

  const t = translations[language];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-center p-6">
      {/* Title */}
      <h1 className="leading-normal text-4xl font-bold text-gray-800 mb-4">
        {t.title}
      </h1>

      {/* Description */}
      <p className="text-lg text-gray-600 mb-8 max-w-lg">{t.description}</p>

      {/* Booking Link */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="inline-block"
      >
        <Link
          href="https://www.dineout.is/mamareykjavik?isolation=true"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#ff914d] hover:bg-[#e68345] hover:tracking-widest text-white font-light py-3 px-6 rounded-full transition-all duration-300 ease-in-out shadow-md"
        >
          {t.buttonText}
        </Link>
      </motion.div>
    </div>
  );
}
