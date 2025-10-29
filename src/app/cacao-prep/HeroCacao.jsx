"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import DualLanguageText from "@/app/components/DualLanguageText";

const logoUrl =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752335914/mama-cacao-logo_seug7k.png";
const cacaoPlantUrl =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752335005/caca_c1ku48.webp";

const cacaoPlantUrl2 =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752336814/cacao-plant_r2allw.jpg";

const HeroCacao = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      subtitle: "The Art of Making",
      title: "Ceremonial Cacao",
      description: "A sacred cup to awaken your heart and center your spirit.",
      quote: "The food of the gods.",
    },
    is: {
      subtitle: "Listin að skapa",
      title: "Seramóniu kakó",
      description:
        "Hinn heilagi drykkur sem opnar hjartað og miðjar andann þinn.",
      quote: "Fæða guðanna.",
    },
  };

  const t = translations[language];

  return (
    <section className="flex flex-col justify-center items-center text-center py-8 sm:py-12 pt-16 sm:pt-20 lg:pt-32 px-4 sm:px-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-2xl sm:text-3xl md:text-5xl font-light mb-4 sm:mb-6"
      >
        <span className="text-xl sm:text-2xl md:text-4xl mt-24 font-aegean">
          - {t.subtitle} -
        </span>
        <br />
        <span className="text-3xl sm:text-4xl md:text-6xl font-aegean">
          {t.title}
        </span>
      </motion.div>
      <motion.p
        className="max-w-xl font-extralight tracking-wide mx-auto text-base sm:text-lg md:text-xl mb-3 sm:mb-4 px-2"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        {t.description}
      </motion.p>
      <motion.p
        className="max-w-xl font-extralight tracking-wide mx-auto text-sm sm:text-base md:text-lg px-2"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
      >
        &quot;{t.quote}&quot;
      </motion.p>
      {/* Logo trio: responsive layout for mobile */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 my-6 sm:my-8 w-full px-2">
        {/* Left faded logo */}
        <Image
          src={cacaoPlantUrl2}
          alt="Cacao plant left"
          width={240}
          height={240}
          className="w-20 sm:w-24 md:w-32 lg:w-48 xl:w-60 h-auto mx-1 sm:mx-2 rounded-full object-cover"
          aria-hidden="true"
          priority
        />
        {/* Center main logo */}
        <Image
          src={logoUrl}
          alt="Mama Cacao Logo center"
          width={240}
          height={240}
          className="w-20 sm:w-24 md:w-32 lg:w-48 xl:w-60 h-auto mx-1 sm:mx-2"
          aria-hidden="true"
          priority
        />
        {/* Right cacao plant image, rounded full */}
        <Image
          src={cacaoPlantUrl}
          alt="Cacao plant right"
          width={240}
          height={240}
          className="w-20 sm:w-24 md:w-32 lg:w-48 xl:w-60 h-auto mx-1 sm:mx-2 rounded-full object-cover"
          aria-hidden="true"
          priority
        />
      </div>
    </section>
  );
};

export default HeroCacao;
