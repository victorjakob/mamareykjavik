"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";

function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
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

export default function Community() {
  const { language } = useLanguage();

  const translations = {
    en: {
      kicker: "The community",
      title: "The Power of Community",
      paragraph1:
        "At Mama, we believe that a true sense of belonging and transformation comes from community. We are a collective of yogis, artists, travelers, musicians, healers, and nature lovers, all working together to create a space where everyone is welcomed and valued.",
      paragraph2:
        "Our goal is to uplift, educate, and inspire—whether through a shared meal, a heartfelt conversation, or an unforgettable experience.",
    },
    is: {
      kicker: "Samfélagið",
      title: "Kraftur samfélagsins",
      paragraph1:
        "Hjá Mama trúum við því að sönn tilfinning um tilheyrslu og umbreyting komi frá samfélaginu. Við erum hópur jóga, listamanna, ferðalanga, tónlistarmanna, heilara og náttúruunnenda, við vinnum saman að því að skapa rými þar sem allir eru velkomnir og séðir.",
      paragraph2:
        "Markmið okkar er að lyfta, mennta og innblása, hvort sem það er í gegnum sameiginlega máltíð, innlægt samtal eða ógleymanlega reynslu.",
    },
  };

  const t = translations[language];

  return (
    <section data-navbar-theme="dark" className="w-full bg-[#0e0b08] py-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

        {/* Image */}
        <FadeUp delay={0.05} className="order-2 md:order-1">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2Fwhitelotuscommunity.png?alt=media&token=5f9026e7-7a3e-4102-972c-2f23ee6771e0"
              alt="Mama Community Gathering"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
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
            <p className="text-[#a09488] text-base md:text-lg leading-[1.85]">{t.paragraph1}</p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <p className="text-[#8a7e72] text-base leading-[1.85]">{t.paragraph2}</p>
          </FadeUp>
        </div>

      </div>
    </section>
  );
}
