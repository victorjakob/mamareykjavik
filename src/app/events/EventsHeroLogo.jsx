"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const EventsHeroLogo = ({ listType = "upcoming" }) => {
  const { language } = useLanguage();

  const translations = {
    en: {
      upcomingTitle: "Upcoming Events",
      pastTitle: "Past Events",
    },
    is: {
      upcomingTitle: "Væntanlegir viðburðir",
      pastTitle: "Liðnir viðburðir",
    },
  };

  const t = translations[language];
  const title = listType === "past" ? t.pastTitle : t.upcomingTitle;

  return (
    <div className="relative w-full h-[80vh] min-h-[560px] overflow-hidden">
      {/* Background image — Ken Burns zoom-out */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.07 }}
        animate={{ scale: 1.0 }}
        transition={{ duration: 2.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Image
          src="https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1600,q_auto,f_auto/v1762151401/white_lotus_wedding_ceremony_ju7bpe.jpg"
          alt="White Lotus venue"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Deep cinematic vignette — black + slight cool edge; strong top / bottom / sides */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background: [
            "radial-gradient(ellipse 115% 88% at 50% 46%, rgba(0,0,0,0) 18%, rgba(0,0,0,0.48) 52%, rgba(10,12,18,0.78) 100%)",
            "linear-gradient(180deg, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0.26) 34%, rgba(0,0,0,0.28) 66%, rgba(0,0,0,0.82) 100%)",
            "linear-gradient(90deg, rgba(0,0,0,0.56) 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 84%, rgba(0,0,0,0.56) 100%)",
            "linear-gradient(180deg, rgba(18,22,30,0.17) 0%, transparent 45%, rgba(18,22,30,0.24) 100%)",
          ].join(","),
        }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-end pb-16 px-6 text-center">
        {/* White Lotus logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-48 sm:w-56 md:w-64 aspect-[724/787] mb-8"
        >
          <Image
            src="https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1766567396/wl-darkbg_lfm9ye.png"
            alt="White Lotus Logo"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="font-cormorant font-light italic text-[#f0ebe3] leading-tight"
          style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)" }}
        >
          {title}
        </motion.h1>

        {/* Fade-line ornament */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center gap-0 mt-7"
        >
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/20" />
          <div className="w-px h-5 bg-gradient-to-b from-white/20 via-white/40 to-[#ff914d]/60" />
          <div className="w-1 h-1 rounded-full bg-[#ff914d]/70 mt-0.5" />
        </motion.div>
      </div>
    </div>
  );
};

export default EventsHeroLogo;
