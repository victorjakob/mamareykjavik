"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import DualLanguageText from "@/app/components/DualLanguageText";

export default function Welcome() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Welcome to Mama \n A Home for Nourishment & Community",
      description:
        "At Mama, we believe in the transformative power of conscious living and mindful nourishment. Our mission extends beyond serving delicious, wholesome food, we're here to cultivate a space where community thrives, health flourishes, and positive change takes root. Every meal we serve is a step towards a more sustainable, compassionate, and healthier world.",
    },
    is: {
      title: "Velkomin á Mama \n Heimili fyrir næringu og samfélag",
      description:
        "Hjá Mama trúum við á umbreytandi kraft meðvitaðrar lífsstíls og huglægrar næringar. Markmið okkar nær lengra en að bera fram ljúffengan og hollan mat, við erum hér til að skapa rými þar sem samfélög tengjast, heilsan blómstrar og jákvæðar breytingar fara af stað. Hver máltíð sem við berum fram er skref í átt að sjálfbærari, samúðarfyllri og heilbrigðari heimi.",
    },
  };

  const t = translations[language];

  return (
    <section className="mt-32 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl text-center"
      >
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="pt-1 pb-6 text-3xl md:text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-[#455318] to-[#698d42] bg-clip-text text-transparent"
        >
          <DualLanguageText
            en="Welcome to Mama"
            is="Velkomin á Mama"
            element="span"
            className="block font-aegean"
          />
          <br />
          <DualLanguageText
            en="A Home for Nourishment & Community"
            is="Heimili fyrir næringu og samfélög"
            element="span"
            className="block font-sans font-extralight"
          />
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-700"
        >
          <DualLanguageText
            en="At Mama, we believe in the transformative power of conscious living and mindful nourishment. Our mission extends beyond serving delicious, wholesome food – we're here to cultivate a space where community thrives, health flourishes, and positive change takes root. Every meal we serve is a step towards a more sustainable, compassionate, and healthier world."
            is="Á Mama trúum við á umbreytingarmátt meðvitaðs lífs og hugfúsrar næringar. Verkefni okkar nær út fyrir það að þjóna góðum, heilsusamlegum mat – við erum hér til að rækta rými þar sem samfélag blómstrar, heilsa dafnar og jákvæðar breytingar taka rót. Hver máltíð sem við þjónum er skref í átt að sjálfbærari, samúðarfullari og heilsusamlegri heimi."
            element="p"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
