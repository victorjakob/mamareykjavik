"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";

function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Story() {
  const { language } = useLanguage();

  const translations = {
    en: {
      kicker: "Our story",
      title: "The Birth of Mama",
      paragraph1:
        "Mama was born from a simple idea—a group of friends seeking to create a space that embodied love, sustainability, and nourishment. What started as a humble desire to craft the best hummus in town quickly evolved into a vegan haven, a communal space where wellness and creativity intertwine.",
      paragraph2:
        "We found our home in one of Reykjavik's historical buildings, and with dedication and heart, we transformed it into a thriving hub for conscious living. Mama is not just about serving plant-based meals; it is about fostering an environment where culture, art, spirituality, and sustainability come together in harmony.",
      imageCaption: "Inside Mama Reykjavík",
    },
    is: {
      kicker: "Saga okkar",
      title: "Fæðing Mama",
      paragraph1:
        "Mama varð til út frá einfaldri hugmynd, hópur vina og fjölskylda sem vildu skapa rými sem innihélt ást, sjálfbærni og næringu. Það sem byrjaði sem auðmjúk löngun til að búa til besta hummusinn í bænum þróaðist fljótt í vegan paradís, sameiginlegt rými þar sem vellíðan og sköpun fléttast saman.",
      paragraph2:
        "Við fundum heimili okkar í einni af sögufrægu byggingum Reykjavíkur og með hollustu og hjartalagi breyttum við því í blómlegt miðstöð fyrir meðvitaða lífsstíl. Mama snýst ekki bara um að bera fram jurtabundnar máltíðir; það snýst um að hlúa að umhverfi þar sem menning, list, andleg máltíðir og sjálfbærni koma saman í sátt.",
      imageCaption: "Inni í Mama Reykjavík",
    },
  };

  const t = translations[language];

  return (
    <section data-navbar-theme="dark" className="w-full bg-[#0e0b08] pt-12 md:pt-20 pb-12">
      <div className="max-w-7xl mx-auto w-full px-5 lg:px-10 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 md:items-start">

        {/* Image */}
        <FadeUp delay={0.05} className="order-2 md:order-1">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2FIMG_0943%20Large.jpeg?alt=media&token=d92fba85-d61f-4c4f-9be2-e9712a889c25"
              alt="Mama Restaurant Interior"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
            <p className="absolute bottom-4 left-5 text-[10px] uppercase tracking-[0.3em] text-white/50 italic">
              {t.imageCaption}
            </p>
          </div>
        </FadeUp>

        {/* Text */}
        <div className="order-1 md:order-2 space-y-6">
          <FadeUp>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/40" />
              <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">{t.kicker}</span>
            </div>
            <h2
              className="font-cormorant font-light italic text-[#f0ebe3] leading-tight"
              style={{ fontSize: "clamp(2.2rem, 4vw, 3.6rem)" }}
            >
              {t.title}
            </h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <p className="text-[#c0b4a8] text-base md:text-lg leading-[1.85]">{t.paragraph1}</p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <p className="text-[#9a8e82] text-base leading-[1.85]">{t.paragraph2}</p>
          </FadeUp>
        </div>

      </div>
    </section>
  );
}
