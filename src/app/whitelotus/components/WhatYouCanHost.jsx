"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

export default function WhatYouCanHost() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "What You Can Host Here",
      categories: [
        "DJ Events & Dance Nights",
        "Live Music & Concerts",
        "Ceremonies & Rituals",
        "Cultural Talks & Workshops",
        "Private Celebrations",
        "Corporate Events",
        "Yoga & Breathwork",
        "Graduations & Milestones",
        "So much more",
      ],
    },
    is: {
      title: "Viðburðir sem hægt er að halda hér",
      categories: [
        "DJ-kvöld og dansviðburðir",
        "Tónleikar og lifandi tónlist",
        "Athafnir og helgisiðir",
        "Menningarviðburðir, fyrirlestrar og vinnustofur",
        "Einkasamkvæmi og veislur",
        "Fyrirtækjaviðburðir",
        "Jóga og öndun",
        "Útskriftir og tímamót",
        "… og margt fleira",
      ],
    },
  };

  const t = translations[language];

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t.title}
        </motion.h2>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {t.categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-50 border border-gray-200 rounded-full text-sm sm:text-base text-gray-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-900 transition-colors cursor-default"
            >
              {category}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

