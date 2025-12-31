"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
  BeakerIcon, // safe in heroicons/24/outline
} from "@heroicons/react/24/outline";

// Motion helpers
const easeOut = [0.16, 1, 0.3, 1];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const containerMobile = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

const cardIn = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: easeOut },
  },
};

function Pill({ icon: Icon, title, text, delay = 0 }) {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const motionOK = !reduceMotion && !isMobile;

  return (
    <motion.div
      variants={cardIn}
      whileHover={
        motionOK
          ? { y: -6, scale: 1.01 }
          : undefined
      }
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 18,
        delay,
      }}
      className="group relative transform-gpu"
    >
      {/* Glow */}
      {motionOK && (
        <div className="absolute -inset-1 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div
            className="absolute inset-0 rounded-[22px]"
            style={{
              background:
                "radial-gradient(700px 220px at 30% 20%, rgba(255,255,255,0.45) 0%, transparent 55%), radial-gradient(700px 220px at 70% 80%, rgba(255,220,190,0.28) 0%, transparent 60%)",
            }}
          />
        </div>
      )}

      {/* Card */}
      <div className="relative overflow-hidden rounded-[22px] border border-black/5 bg-white/85 md:bg-white/70 md:backdrop-blur-xl shadow-sm">
        {/* Animated gradient stroke on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          initial={false}
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [0.0, 1.0, 1.0],
                }
          }
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            borderRadius: "22px",
            padding: 1,
            background:
              "linear-gradient(135deg, rgba(255,200,160,0.60), rgba(180,200,255,0.45), rgba(255,240,210,0.55))",
          }}
        >
          <div className="h-full w-full rounded-[21px] bg-white/80 md:bg-white/65 md:backdrop-blur-xl" />
        </motion.div>

        {/* Content layer */}
        <div className="relative p-5 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Icon chip */}
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-2xl border border-black/5 bg-white/85 md:bg-white/75 md:backdrop-blur flex items-center justify-center shadow-sm">
                <Icon className="w-6 h-6 text-gray-900/80" />
              </div>

              {/* Tiny orbiting spark */}
              {motionOK && (
                <motion.span
                  className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-black/20"
                  animate={{ opacity: [0.2, 0.7, 0.2], scale: [1, 1.4, 1] }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="text-sm sm:text-base font-semibold text-gray-900">
                {title}
              </div>
              <div className="mt-1 text-sm sm:text-base text-gray-600 leading-relaxed">
                {text}
              </div>
            </div>
          </div>

          {/* Shimmer sweep */}
          {motionOK && (
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.div
                className="absolute -inset-y-6 -left-1/2 w-1/3 rotate-12"
                animate={{ x: ["-40%", "220%"] }}
                transition={{ duration: 1.15, ease: "easeInOut" }}
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function CateringAndBarFancy() {
  const { language } = useLanguage();
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const motionOK = !reduceMotion && !isMobile;

  const translations = {
    en: {
      kicker: "Optional add-ons",
      title: "Private catering & professional bar",
      description:
        "Upgrade your event with full-service food and a curated bar. Tailored to your guests, timing, and the feel of the night — planned and run by experienced staff.",
      p1Title: "Chef-led catering",
      p1Text: "Plated, buffet, or sharing style — designed for your event.",
      p2Title: "Tailored details",
      p2Text: "Dietary needs, timing, and vibe — fully customizable.",
      p3Title: "Professional bar",
      p3Text: "Curated drinks + experienced bartenders for smooth service.",
      p4Title: "Full service",
      p4Text: "Setup, service, and flow — so you can focus on your guests.",
      badge1: "Catering",
      badge2: "Bar",
    },
    is: {
      kicker: "Valfrjálst aukaatriði",
      title: "Einkamatvist & faglegur bar",
      description:
        "Lyftu viðburðinum með fullri matþjónustu og sérsniðnum bar. Aðlagað að gestum, tímasetningum og stemningu kvöldsins — skipulagt og framkvæmt af reyndu teymi.",
      p1Title: "Einkamatvist",
      p1Text: "Diskamatur, hlaðborð eða deiliréttir — hannað fyrir viðburðinn.",
      p2Title: "Sérsniðið",
      p2Text: "Matarvenjur, tímasetningar og stemning — allt aðlagað.",
      p3Title: "Faglegur bar",
      p3Text: "Valin drykkjarskrá + reyndir barþjónar fyrir flæði í þjónustu.",
      p4Title: "Heildarlausn",
      p4Text:
        "Uppsetning, þjónusta og flæði — þannig að þú einbeitir þér að gestunum.",
      badge1: "Matþjónusta",
      badge2: "Bar",
    },
  };

  const t = translations[language] || translations.en;

  return (
    <section className="relative py-14 sm:py-18 md:py-20 overflow-hidden w-full">
      {/* Cinematic ambient background - full width */}
      <div
        className="absolute inset-0 pointer-events-none w-full"
        style={{
          background:
            "radial-gradient(1100px 480px at 18% 30%, rgba(255,205,170,0.24) 0%, transparent 60%), radial-gradient(1000px 520px at 82% 65%, rgba(190,210,255,0.20) 0%, transparent 62%), linear-gradient(180deg, rgba(255,255,255,0.60), rgba(255,255,255,0.80))",
        }}
      />

      {/* Floating "bokeh" - disabled on mobile */}
      {motionOK && (
        <>
          <motion.div
            className="absolute -top-16 left-8 w-64 h-64 rounded-full blur-3xl opacity-25"
            animate={{ y: [0, 22, 0], x: [0, 10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(circle, rgba(255,185,140,0.65) 0%, transparent 60%)",
            }}
          />
          <motion.div
            className="absolute -bottom-20 right-10 w-72 h-72 rounded-full blur-3xl opacity-20"
            animate={{ y: [0, -26, 0], x: [0, -12, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(circle, rgba(170,200,255,0.6) 0%, transparent 62%)",
            }}
          />
        </>
      )}

      <div className="relative container mx-auto px-4 ">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left: Copy */}
          <motion.div
            initial={isMobile ? "show" : "hidden"}
            animate={isMobile ? "show" : undefined}
            whileInView={isMobile ? undefined : "show"}
            viewport={{ once: true, amount: 0.35 }}
            variants={isMobile ? containerMobile : container}
            className="lg:col-span-5 transform-gpu"
            suppressHydrationWarning
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/85 md:bg-white/70 md:backdrop-blur px-3 py-1 shadow-sm">
                <span className="text-[11px] sm:text-xs tracking-[0.22em] uppercase text-gray-700">
                  {t.kicker}
                </span>
              </div>

              <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
                {t.title}
              </h2>

              {/* Fancy underline */}
              <div className="mt-3 h-[2px] w-20 mx-0 lg:mx-0 bg-gradient-to-r from-black/10 via-black/25 to-transparent" />

              <p className="mt-4 text-base sm:text-lg text-gray-700 leading-relaxed">
                {t.description}
              </p>

              {/* Badges */}
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-black/5 bg-white/85 md:bg-white/70 md:backdrop-blur px-3 py-1 text-xs text-gray-700">
                  {t.badge1}
                </span>
                <span className="rounded-full border border-black/5 bg-white/85 md:bg-white/70 md:backdrop-blur px-3 py-1 text-xs text-gray-700">
                  {t.badge2}
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Feature pills */}
          <motion.div
            initial={isMobile ? "show" : "hidden"}
            animate={isMobile ? "show" : undefined}
            whileInView={isMobile ? undefined : "show"}
            viewport={{ once: true, amount: 0.35 }}
            variants={isMobile ? containerMobile : container}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 transform-gpu"
            suppressHydrationWarning
          >
            <Pill icon={SparklesIcon} title={t.p1Title} text={t.p1Text} />
            <Pill
              icon={AdjustmentsHorizontalIcon}
              title={t.p2Title}
              text={t.p2Text}
              delay={0.03}
            />
            <Pill
              icon={BeakerIcon}
              title={t.p3Title}
              text={t.p3Text}
              delay={0.06}
            />
            <Pill
              icon={UserGroupIcon}
              title={t.p4Title}
              text={t.p4Text}
              delay={0.09}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
