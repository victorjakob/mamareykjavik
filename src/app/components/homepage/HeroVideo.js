"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import DualLanguageText from "@/app/components/DualLanguageText";

export default function HeroVideo() {
  const { language } = useLanguage();
  const videoRef = useRef(null);

  const translations = {
    en: {
      title: "Earth Medicine",
      seeMenu: "See Menu",
      bookTable: "Book Table",
    },
    is: {
      title: "Velkomin",
      seeMenu: "Matseðill",
      bookTable: "Bóka Borð",
    },
  };

  const t = translations[language];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Image
        src="https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2FMamawalkthroushscreen.png?alt=media&token=3f69d80a-cc99-44ac-aa16-55b6c87609b1"
        alt="Mama Restaurant"
        fill
        className="object-cover"
        priority
      />
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source
          src="https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2FMama%20Restaurant%202.mp4?alt=media&token=11269e99-5406-46d2-a5cb-3ff59107d0c7"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 sm:gap-24 md:gap-32 lg:gap-40 xl:gap-48 md:justify-between md:pb-20">
        <div className="md:flex-1 flex items-center">
          <DualLanguageText
            en="Earth Medicine"
            is="Velkomin"
            element="h1"
            className="drop-shadow-2xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold text-center tracking-wider"
          />
        </div>

        <div className="flex gap-4 sm:gap-6">
          <Link
            href="/restaurant/menu"
            className="px-5 py-2.5 sm:px-6 sm:py-3 tracking-widest rounded-full bg-white/90 text-orange-600 hover:bg-white transition-all duration-300 text-sm sm:text-base md:text-lg font-medium shadow-sm backdrop-blur-sm"
          >
            {t.seeMenu}
          </Link>
          <Link
            href="/restaurant/book-table"
            className="px-5 py-2.5 sm:px-6 sm:py-3 tracking-widest text-white rounded-full bg-orange-500/90 hover:bg-orange-600 transition-all duration-300 text-sm sm:text-base md:text-lg font-medium shadow-sm backdrop-blur-sm"
          >
            {t.bookTable}
          </Link>
        </div>
      </div>
    </div>
  );
}
