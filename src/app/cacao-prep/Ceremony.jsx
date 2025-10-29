"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";

const CacaoCeremony = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Make it Sacred!",
      intro:
        "When you prepare cacao for use in a ceremony, make the preparation a ritual itself.",
      points: [
        "Be mindful of why you are preparing your cacao.",
        "Take your time",
        "Send your prayers and intentions to the drink as you make it",
        "Hold love in your heart as you do",
        "Serve it in your favourite mug or ceremonial cup",
      ],
    },
    is: {
      title: "Gerðu það helgað!",
      intro:
        "Þegar þú útbýrð kakó fyrir athöfn, gerðu sjálfa undirbúninginn að helgisið.",
      points: [
        "Vertu meðvituð/ur um ástæðuna fyrir því að þú útbýrð kakóið.",
        "Gefðu þér tíma.",
        "Sendu bænir og ásetning þinn inn í drykkinn á meðan þú útbýrð hann.",
        "Haltu ást í hjartanu meðan þú gerir það.",
        "Berðu það fram í uppáhalds bollanum þínum.",
      ],
    },
  };

  const t = translations[language];

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 sm:gap-8">
      {/* Image on the left */}
      <motion.div
        className="w-full md:w-1/2 flex justify-center order-2 md:order-1"
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <Image
          src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752239808/giving-thanks_xibufq.jpg"
          alt="Cacao plant illustration"
          width={400}
          height={300}
          className="rounded-xl shadow-lg object-cover max-w-full w-full max-w-sm sm:max-w-md"
          priority
        />
      </motion.div>
      {/* Text on the right */}
      <div className="w-full md:w-1/2 text-center md:text-left order-1 md:order-2">
        <motion.h2
          className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span role="img" aria-label="sparkles" className="mr-2">
            ✨
          </span>
          {t.title}
        </motion.h2>
        <motion.p
          className="text-base sm:text-lg md:text-xl font-light mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {t.intro}
        </motion.p>
        <motion.div
          className="space-y-3 sm:space-y-4 text-sm sm:text-base md:text-lg font-extralight text-left mx-auto max-w-sm sm:max-w-md"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {t.points.map((point, idx) => (
            <div key={idx}>{point}</div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CacaoCeremony;
