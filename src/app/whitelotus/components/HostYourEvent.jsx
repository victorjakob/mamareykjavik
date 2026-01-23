"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  PencilSquareIcon,
  Squares2X2Icon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const easeOut = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

const listMobile = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
};

function StepCard({ index, icon: Icon, title, text }) {
  return (
    <motion.div
      variants={fadeUp}
      className="relative overflow-hidden rounded-3xl border border-black/5 bg-white/85 md:bg-white/70 md:backdrop-blur-xl shadow-sm transform-gpu"
    >
      {/* subtle top line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-black/15 to-transparent" />

      {/* number bubble */}
      <div className="absolute top-5 right-5">
        <div className="w-10 h-10 rounded-2xl border border-black/5 bg-white/80 md:backdrop-blur flex items-center justify-center shadow-sm">
          <span className="text-sm font-semibold text-gray-900">{index}</span>
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl border border-black/5 bg-white/80 md:backdrop-blur flex items-center justify-center shadow-sm shrink-0">
            <Icon className="w-6 h-6 text-gray-900/80" />
          </div>

          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-semibold text-gray-900">
              {title}
            </div>
            <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed">
              {text}
            </p>
          </div>
        </div>
      </div>

      {/* bottom accent */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
    </motion.div>
  );
}

export default function HostYourEvent() {
  const { language } = useLanguage();
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const translations = {
    en: {
      kicker: "Booking",
      title: "Host your event at White Lotus",
      description:
        "Tell us what you’re planning — date, guest count, and any technical needs. We’ll reply with tailored options for layout and pricing, so you can confirm quickly and move forward with confidence.",
      buttonText: "Send Inquiry",
      howItWorks: "How it works",
      step1Title: "Share the idea",
      step1Text: "Date, guest count, and what kind of event you’re hosting.",
      step2Title: "Get your options",
      step2Text: "We suggest layout + pricing and answer any questions.",
      step3Title: "Confirm & create",
      step3Text: "You confirm — we align details and make it smooth.",
    },
    is: {
      kicker: "Bókun",
      title: "Haltu viðburðinn þinn í White Lotus",
      description:
        "Láttu okkur vita hvað þú ert að plana — dagsetningu, gestafjölda og tæknibúnað sem þarf. Við sendum þér tillögur að uppröðun og verðtilboði sem passar, svo þú getir gengið frá bókuninni á einfaldan og öruggan hátt.",
      buttonText: "Senda fyrirspurn",
      howItWorks: "Hvernig þetta fer fram",
      step1Title: "Deildu hugmyndinni",
      step1Text: "Dagsetning, gestafjöldi og tegund viðburðar.",
      step2Title: "Fáðu valkostina",
      step2Text: "Við leggjum til skipulag + verð og svörum spurningum.",
      step3Title: "Láttu verða að veruleika",
      step3Text: "Þú staðfestir — við stillum allt saman og gerum þetta auðvelt.",
    },
  };

  const t = translations[language] || translations.en;

  const steps = [
    { icon: PencilSquareIcon, title: t.step1Title, text: t.step1Text },
    { icon: Squares2X2Icon, title: t.step2Title, text: t.step2Text },
    { icon: CheckCircleIcon, title: t.step3Title, text: t.step3Text },
  ];

  return (
    <section className="relative py-14 sm:py-18 md:py-20 overflow-hidden w-full">
      {/* Ambient background (subtle, premium) - full width */}
      <div
        className="absolute inset-0 pointer-events-none w-full"
        style={{
          background:
            "radial-gradient(1000px 480px at 22% 25%, rgba(255,205,170,0.18) 0%, transparent 60%), radial-gradient(900px 520px at 85% 70%, rgba(190,210,255,0.16) 0%, transparent 62%)",
        }}
      />

      <div className="relative container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={isMobile || reduceMotion ? "show" : "hidden"}
          animate={isMobile || reduceMotion ? "show" : undefined}
          whileInView={isMobile || reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.35 }}
          variants={isMobile ? listMobile : list}
          className="text-center max-w-3xl mx-auto transform-gpu"
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

            <p className="mt-4 text-base sm:text-lg text-gray-700 leading-relaxed">
              {t.description}
            </p>

            <div className="mt-7">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
              >
                <Link
                  href="/whitelotus/rent"
                  className="relative overflow-hidden rounded-full bg-gradient-to-r from-[#c9a063] via-[#a77d3b] to-[#8f6a2f] text-white px-8 py-4 inline-block text-center font-semibold text-base sm:text-lg transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:from-[#d4b070] hover:via-[#b88a4a] hover:to-[#9d7540]"
                  aria-label={t.buttonText}
                >
                  <span className="relative z-10">{t.buttonText}</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial={isMobile || reduceMotion ? "show" : "hidden"}
          animate={isMobile || reduceMotion ? "show" : undefined}
          whileInView={isMobile || reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.35 }}
          variants={isMobile ? listMobile : list}
          className="mt-10 sm:mt-12 transform-gpu"
          suppressHydrationWarning
        >
          <motion.h3
            variants={fadeUp}
            className="text-center text-lg sm:text-xl font-semibold text-gray-900 mb-6 sm:mb-8"
          >
            {t.howItWorks}
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {steps.map((s, idx) => (
              <StepCard
                key={s.title}
                index={idx + 1}
                icon={s.icon}
                title={s.title}
                text={s.text}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
