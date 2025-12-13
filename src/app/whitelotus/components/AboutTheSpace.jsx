"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

export default function AboutTheSpace() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "About the Space",
      description:
        "White Lotus is an intimate, high-quality venue designed for conscious gatherings and creative expression. Located in the heart of downtown Reykjavík, our space offers a refined atmosphere where music, movement, ceremony, and celebration come together.",
      bullet1: "Intimate & premium atmosphere",
      bullet2: "Flexible layout for any event type",
      bullet3: "Professional sound & lighting systems",
    },
    is: {
      title: "Um rýmið",
      description:
        "White Lotus er náið og vandað viðburðarými hannað fyrir meðvitaðar samverur og skapandi tjáningu. Rýmið er staðsett í hjarta miðbæjar Reykjavíkur og býður upp á faglegt andrúmsloft þar sem tónlist, hreyfing, athafnir og hátíðahöld mætast.",
      bullet1: "Náið og vandað andrúmsloft",
      bullet2: "Sveigjanlegt skipulag fyrir fjölbreytta viðburði",
      bullet3: "Hágæða hljóð- og ljósabúnaður",
    },
  };

  const t = translations[language];

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t.title}
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            {t.description}
          </p>
          <ul className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center pt-4">
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-2 text-gray-700"
            >
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              {t.bullet1}
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-2 text-gray-700"
            >
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              {t.bullet2}
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-2 text-gray-700"
            >
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              {t.bullet3}
            </motion.li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
