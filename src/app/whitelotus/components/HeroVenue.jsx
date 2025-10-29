"use client";

import { Button } from "@/app/components/Button";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import DualLanguageText from "@/app/components/DualLanguageText";

export default function HeroVenue() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Exclusive event venue in the heart of the city",
      description:
        "Located in the vibrant downtown Reykjavik\na dynamic hub brimming with cultural events and activities",
      buttonText: "Contact Now",
    },
    is: {
      title: "Viðburðarstaður í hjarta borgarinnar",
      description:
        "Staðsett í miðbæ Reykjavíkur, dýnamísk miðstöð fullri af menningarviðburðum og afþreyingum",
      buttonText: "Hafðu samband",
    },
  };

  const t = translations[language];

  return (
    <div className="container mx-auto px-4 space-y-12 text-center mt-28">
      <Image
        src="/whitelotus/whitelotuslogo.png"
        alt="White Lotus Logo"
        width={1161}
        height={1020}
        className="mx-auto w-64 h-auto"
      />
      <DualLanguageText
        en={t.title}
        is={t.title}
        element="h1"
        className="text-3xl w-2/3 md:text-4xl font-bold mb-4 max-w-3xl mx-auto"
      />
      <p className="w-4/5 font-light mx-auto text-xl md:text-2xl mb-8 whitespace-pre-line">
        {t.description}
      </p>
      <Button href={"whitelotus/rent"} label={"Book Your Event Now"}>
        {t.buttonText}
      </Button>
    </div>
  );
}
