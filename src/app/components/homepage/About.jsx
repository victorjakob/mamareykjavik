"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

export default function About() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "About Us",
      description:
        "Nestled in the heart of Reykjavik, Mama is more than just a restaurant—it is a sanctuary of nourishment, connection, and holistic living. Rooted in the values of wholeness, vitality, health, and community, Mama is a place where food becomes medicine, and where people from all walks of life gather to celebrate, share, and grow.",
      learnMore: "Learn More",
    },
    is: {
      title: "Um okkur",
      description:
        "Mama er staðsett í hjarta Reykjavíkur og er meira en bara veitingastaður – það er griðastaður næringar, tengsla og heildrænnar lífsstíls. Með rætur í gildum heilsu, kærleiks, sjálfbærni og samvinnu er Mama staður þar sem matur verður að lækningu og þar sem fólk úr öllum hornum samfélagsins koma saman til að fagna, deila og vaxa.",
      learnMore: "Lesa meira",
    },
  };

  const t = translations[language];

  return (
    <section className="relative my-16 sm:my-24 md:my-36 px-4 sm:px-6 isolate">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-[#f0ebe3] text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 md:mb-10 text-center">
          {t.title}
        </h2>
        <p className="text-[#a09488] text-base sm:text-lg text-center mx-auto max-w-3xl mb-8 sm:mb-10 md:mb-12 leading-relaxed">
          {t.description}
        </p>
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="inline-block"
        >
          <Link
            href="/about"
            className="relative overflow-hidden rounded-full bg-[#ff914d] border border-[#ff914d] text-black py-3 px-8 inline-block text-center font-semibold transition-all duration-300 ease-in-out hover:brightness-110 hover:shadow-lg hover:shadow-[#ff914d]/20"
          >
            <span className="relative z-10">{t.learnMore}</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
