"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";

const CacaoPreparation = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "How to Prepare the Cacao",
      steps: [
        "Chop the cacao finely.",
        "Warm the water gently – don't let it boil.",
        "Add water slowly to the cacao, on low heat, creating a paste and slowly finding the right consistency.",
        "Mix in spices of your choice.",
        "Blend if you like it frothy – this activates the texture beautifully. Step 3 is not neccesary if you use a blender.",
        "Pour into your favorite cup.",
      ],
    },
    is: {
      title: "Hvernig á að útbúa kakóið",
      steps: [
        "Saxaðu kakóið fínt.",
        "Hitaðu vatnið varlega – láttu það ekki sjóða.",
        "Bætið vatninu smám saman við kakóið, á lágum hita, þar til þú færð mjúka og fallega áferð.",
        "Bættu við kryddum að eigin vali.",
        "Blandaðu í blandara ef þú vilt froðukennda áferð – það virkjar áferðina fallega. (Þú getur sleppt þrepi 3 ef þú notar blandara.)",
        "Helltu í uppáhalds bollann þinn.",
      ],
    },
  };

  const t = translations[language];
  const steps = t.steps;

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 sm:gap-8">
      {/* Text on the left */}
      <div className="w-full md:w-1/2 text-center md:text-left order-2 md:order-1">
        <motion.h2
          className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span role="img" aria-label="fire" className="mr-2">
            🔥
          </span>
          {t.title}
        </motion.h2>
        <motion.ol
          className="mb-4 text-base sm:text-lg md:text-xl font-light space-y-2 sm:space-y-3 list-decimal list-inside text-left mx-auto max-w-sm sm:max-w-md"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {steps.map((step, idx) => (
            <li key={idx} className="leading-relaxed">
              {step}
            </li>
          ))}
        </motion.ol>
      </div>
      {/* Image on the right */}
      <motion.div
        className="w-full md:w-1/2 flex justify-center order-1 md:order-2"
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <Image
          src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752238745/ceremonial-cacao-cup_twp40h.jpg"
          alt="Ceremonial cacao cup"
          width={400}
          height={300}
          className="rounded-xl shadow-lg object-cover max-w-full w-full max-w-sm sm:max-w-md"
          priority
        />
      </motion.div>
    </section>
  );
};

export default CacaoPreparation;
