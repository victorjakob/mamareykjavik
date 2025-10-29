"use client";

import { Button } from "../Button";
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
      {/* Content */}
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-black text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 md:mb-10 text-center">
          {t.title}
        </h2>
        <p className="text-black text-base sm:text-lg text-center mx-auto max-w-3xl mb-8 sm:mb-10 md:mb-12">
          {t.description}
        </p>
        <Button href="/about">{t.learnMore}</Button>
      </div>
    </section>
  );
}
