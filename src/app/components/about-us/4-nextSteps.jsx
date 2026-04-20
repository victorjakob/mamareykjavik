"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
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

export default function NextSteps() {
  const { language } = useLanguage();

  const translations = {
    en: {
      kicker: "Our next chapter",
      title: "Our Next Chapter",
      paragraph1:
        "As Mama has grown, so has our vision. We have expanded into a new space that houses both Mama and our newest endeavor, White Lotus - a cultural and spiritual hub for creativity, wellness, and transformation.",
      paragraph2:
        "This venue hosts yoga, dance, ceremonies, live performances, and conscious gatherings, deepening our mission to cultivate connection and uplift the collective spirit.",
      exploreEvents: "Explore Our Events",
      hostEvent: "Host Your Own Event",
    },
    is: {
      kicker: "Næsta kafli okkar",
      title: "Næsta kafli okkar",
      paragraph1:
        "Eftir því sem mamma hefur vaxið, hefur framtíðarsýn okkar einnig vaxið. Við höfum stækkað í nýtt rými sem hýsir bæði Mama og nýjasta verkefni okkar, White Lotus - menningarleg og andleg viðburðarrými fyrir sköpun, vellíðan og umbreytingu.",
      paragraph2:
        "Þessi vettvangur hýsir jóga, dans, athafnir, lifandi sýningar og meðvitaðar samkomur, sem dýpkar markmið okkar að rækta tengsl og lyfta sameiginlegum anda.",
      exploreEvents: "Kannaðu viðburði okkar",
      hostEvent: "Hýstu þinn eigin viðburð",
    },
  };

  const t = translations[language];

  return (
    <section data-navbar-theme="dark" className="w-full bg-[#1a1208] pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

        {/* Text */}
        <div className="space-y-6 order-1">
          <FadeUp>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
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

          <FadeUp delay={0.2}>
            <div className="flex flex-row gap-3 pt-2">
              <Link
                href="/events"
                className="flex-1 inline-flex items-center justify-center px-5 py-3 bg-[#ff914d] text-black text-sm font-semibold rounded-full hover:bg-[#ff914d]/90 hover:scale-[1.02] transition-all duration-200"
              >
                {t.exploreEvents}
              </Link>
              <Link
                href="/whitelotus"
                className="flex-1 inline-flex items-center justify-center px-5 py-3 border border-[#f0ebe3]/25 text-[#f0ebe3] text-sm rounded-full hover:bg-[#f0ebe3]/[0.07] hover:border-[#f0ebe3]/40 transition-all duration-200"
              >
                {t.hostEvent}
              </Link>
            </div>
          </FadeUp>
        </div>

        {/* WL Logo */}
        <FadeUp delay={0.1} className="order-2 flex items-center justify-center py-8">
          <Image
            src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1766567396/wl-darkbg_lfm9ye.png"
            alt="White Lotus"
            width={1161}
            height={1020}
            className="h-auto w-48 sm:w-64 md:w-72 opacity-90 drop-shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
          />
        </FadeUp>

      </div>
    </section>
  );
}
