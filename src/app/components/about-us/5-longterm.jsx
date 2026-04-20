"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";

function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LongTermVision() {
  const { language } = useLanguage();
  const reduceMotion = useReducedMotion();

  const translations = {
    en: {
      kicker: "Long-term vision",
      title: "Our Long-Term Vision",
      paragraph1:
        "Our journey doesn't stop with the walls of our restaurant. We envision a future where Mama becomes fully self-sustainable, with its own land for organic farming, powered by Iceland's abundant geothermal energy.",
      paragraph2:
        "By growing our own food, reducing waste, and minimizing our environmental footprint, we aim to create a model of regenerative, conscious living—not just for Reykjavik, but as an example for communities worldwide.",
    },
    is: {
      kicker: "Langtíma sjón",
      title: "Langtíma sjón",
      paragraph1:
        "Ferðalag okkar endar ekki við veggi veitingastaðarins. Við sjáum fyrir okkur framtíð þar sem Mama verður fullkomlega sjálfbær, með eigið land fyrir lífræna ræktun, knúið áfram af ríkrí jarðvarmaorku Íslands.",
      paragraph2:
        "Með því að rækta okkar eigin mat, draga úr sóun og lágmarka umhverfisfótspor okkar, stefnum við að því að skapa fyrirmynd endurnýjanlegrar og meðvitaðrar lífsstíls, ekki bara fyrir Reykjavík, líka Ísland að heild og lengra.",
    },
  };

  const t = translations[language];

  return (
    <section
      data-navbar-theme="dark"
      className="relative isolate w-full overflow-hidden bg-[#1a1208] pt-12 pb-28 px-6"
    >
      {/* Ambient background — slow drifting orbs + soft grid */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden={true}>
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 145, 77, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 145, 77, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 75% 60% at 50% 45%, black 15%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 60% at 50% 45%, black 15%, transparent 75%)",
          }}
        />
        <motion.div
          className="absolute -top-[20%] -left-[15%] h-[min(85vw,520px)] w-[min(85vw,520px)] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, rgba(255, 145, 77, 0.28), rgba(255, 120, 60, 0.08) 45%, transparent 70%)",
          }}
          animate={
            reduceMotion
              ? { x: 0, y: 0, scale: 1 }
              : { x: [0, 36, -18, 0], y: [0, -28, 16, 0], scale: [1, 1.12, 0.94, 1] }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 22, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.div
          className="absolute -bottom-[25%] -right-[10%] h-[min(95vw,580px)] w-[min(95vw,580px)] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 60% 55%, rgba(69, 83, 24, 0.35), rgba(150, 191, 107, 0.12) 40%, transparent 68%)",
          }}
          animate={
            reduceMotion
              ? { x: 0, y: 0, scale: 1 }
              : { x: [0, -42, 22, 0], y: [0, 32, -20, 0], scale: [1, 0.92, 1.08, 1] }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 26, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
          }
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[min(70vw,420px)] w-[min(70vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[64px]"
          style={{
            background:
              "radial-gradient(circle, rgba(240, 235, 227, 0.06) 0%, rgba(255, 145, 77, 0.05) 38%, transparent 65%)",
          }}
          animate={
            reduceMotion
              ? { opacity: 0.65, scale: 1 }
              : { opacity: [0.5, 0.85, 0.55, 0.5], scale: [1, 1.06, 0.98, 1] }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 14, repeat: Infinity, ease: "easeInOut", delay: 0.8 }
          }
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#1a1208] via-transparent to-[#1a1208]"
          style={{ opacity: 0.92 }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">

        <FadeUp>
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/40" />
            <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">{t.kicker}</span>
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/40" />
          </div>

          <h2
            className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-8"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }}
          >
            {t.title}
          </h2>
        </FadeUp>

        <FadeUp delay={0.08}>
          <div className="flex flex-col items-center gap-0 mb-10">
            <div className="w-px h-8 bg-gradient-to-b from-transparent to-[#f0ebe3]/10" />
            <div className="w-px h-5 bg-gradient-to-b from-[#f0ebe3]/10 to-[#ff914d]/45" />
            <div className="w-1 h-1 rounded-full bg-[#ff914d]/55 mt-0.5" />
          </div>
        </FadeUp>

        <FadeUp delay={0.12}>
          <p className="text-[#a09488] text-lg md:text-xl leading-[1.85] mb-6">{t.paragraph1}</p>
        </FadeUp>

        <FadeUp delay={0.18}>
          <p className="text-[#8a7e72] text-base md:text-lg leading-[1.85]">{t.paragraph2}</p>
        </FadeUp>

      </div>
    </section>
  );
}
