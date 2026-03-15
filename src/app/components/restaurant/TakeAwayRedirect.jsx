"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

export default function TakeAwayRedirect() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Order Takeaway from Mama Reykjavik",
      description:
        "To order takeaway from Mama Reykjavik, please use our official Wolt page through the link below. We look forward to serving you!",
      buttonText: "Order on Wolt",
    },
    is: {
      title: "Pantaðu takeaway frá Mama Reykjavík",
      description:
        "Til að panta takeaway frá Mama Reykjavík, vinsamlegast notaðu opinberu Wolt síðuna okkar í gegnum hlekkinn hér að neðan. Við hlökkum til að þjóna þér!",
      buttonText: "Panta á Wolt",
    },
  };

  const t = translations[language];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-center p-6">
      <h1 className="leading-normal text-4xl font-bold text-gray-800 mb-4">{t.title}</h1>

      <p className="text-lg text-gray-600 mb-8 max-w-lg">{t.description}</p>

      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="inline-block">
        <Link
          href="https://wolt.com/en/isl/reykjavik/restaurant/mama-reykjavik"
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
