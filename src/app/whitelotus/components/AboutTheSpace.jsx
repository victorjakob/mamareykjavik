"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

export default function AboutTheSpace() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "About the Venue",
      description:
        "White Lotus is an intimate, high-quality venue perfect for private events, parties, and conscious gatherings. Located in the heart of downtown Reykjavík, the space offers a refined atmosphere where music, movement, ceremony, and celebration come together - designed for creative expression, connection, and unforgettable moments.",
    },
    is: {
      title: "Um Vettvanginn",
      description:
        "White Lotus er náinn og vandaður viðburðastaður, fullkominn fyrir einkaviðburði, veislur, partý og meðvitaðar samkomur. Staðurinn er í hjarta miðbæjar Reykjavíkur og býður upp á fágað andrúmsloft þar sem tónlist, hreyfing, athafnir og hátíðahöld mætast — hannað fyrir skapandi tjáningu, tengingu og ógleymanlegar stundir.",
    },
  };

  const t = translations[language] || translations.en;

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.title}
          </h2>

          {/* Modern animated divider */}
          <motion.div
            className="h-[2px] bg-gradient-to-r from-transparent via-black/20 to-transparent w-28 mx-auto rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>

        {/* Benefit line */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={{
            duration: 0.55,
            delay: 0.06,
            type: "spring",
            stiffness: 120,
            damping: 20,
            ease: "easeOut",
          }}
          className="text-center text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto"
        >
          {t.description}
        </motion.div>
      </div>
    </section>
  );
}
