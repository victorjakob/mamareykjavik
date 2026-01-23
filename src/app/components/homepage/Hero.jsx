"use client";

import HeroVideo from "./HeroVideo";
import DualLanguageText from "@/app/components/DualLanguageText";

export default function Hero() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <DualLanguageText
        en="Mama Reykjavik Restaurant"
        is="Mama Reykjavík Veitingastaður"
        element="h1"
        className="sr-only"
        aria-hidden={false}
      />
      <HeroVideo />
    </div>
  );
}
