"use client";

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
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Large decorative watermark — top-right, low contrast, gentle float */
function StepWatermarkIcon({ variant, delay = 0 }) {
  const paths = {
    idea: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09zM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456zM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423z"
      />
    ),
    layout: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 8.25V6zM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25zM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25z"
      />
    ),
    confirm: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
      />
    ),
  };

  const d = paths[variant];
  if (!d) return null;

  return (
    <motion.div
      className="pointer-events-none absolute -right-1 -top-1 sm:right-2 sm:top-2 z-0 text-[#ff914d]"
      aria-hidden
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
    >
      <motion.div
        className="opacity-[0.09] sm:opacity-[0.11]"
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay * 0.5,
        }}
      >
        <svg
          className="h-16 w-16 sm:h-[4.75rem] sm:w-[4.75rem]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.15}
        >
          {d}
        </svg>
      </motion.div>
    </motion.div>
  );
}

function StepCard({ num, title, text, delay, watermark }) {
  return (
    <FadeUp delay={delay}>
      <div
        className="relative overflow-hidden rounded-2xl p-7 transition-colors duration-300 h-full"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "none" }}
      >
        <StepWatermarkIcon variant={watermark} delay={delay + 0.15} />
        <div className="relative z-10 flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-full border border-[#ff914d]/35 bg-[#ff914d]/[0.07] flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#ff914d] font-mono">{String(num).padStart(2, "0")}</span>
          </div>
          <h3 className="text-sm font-bold text-[#f0ebe3]">{title}</h3>
        </div>
        <p className="relative z-10 text-sm text-[#8a7e72] leading-relaxed">{text}</p>
      </div>
    </FadeUp>
  );
}

export default function HostYourEvent() {
  const { language } = useLanguage();

  const t = {
    en: {
      kicker: "Book the venue",
      title: "Host your event\nat White Lotus",
      description:
        "Tell us what you're planning — date, guest count, and any technical needs. We'll reply with layout options and pricing so you can confirm quickly and focus on what matters.",
      buttonPrimary: "Send an Inquiry",
      buttonSecondary: "See Upcoming Events",
      howItWorks: "How it works",
      steps: [
        {
          title: "Share the idea",
          text: "Tell us the date, how many guests you're expecting, and the kind of event you're hosting.",
        },
        {
          title: "Get your options",
          text: "We'll suggest a layout and pricing, and answer any questions you have.",
        },
        {
          title: "Confirm & create",
          text: "You confirm — we handle the details and make sure everything runs smoothly.",
        },
      ],
    },
    is: {
      kicker: "Bóka rýmið",
      title: "Haltu viðburðinn\nþinn í White Lotus",
      description:
        "Láttu okkur vita hvað þú ert að plana — dagsetningu, gestafjölda og tæknibúnað. Við sendum þér tillögur að skipulagi og verðtilboði svo þú getir staðfest fljótt.",
      buttonPrimary: "Senda fyrirspurn",
      buttonSecondary: "Sjá viðburði",
      howItWorks: "Hvernig þetta fer fram",
      steps: [
        {
          title: "Deildu hugmyndinni",
          text: "Dagsetning, gestafjöldi og tegund viðburðar — við þurfum bara þessa þrjá hluti til að byrja.",
        },
        {
          title: "Fáðu valkostina",
          text: "Við leggjum til skipulag og verðtilboð og svörum öllum spurningum.",
        },
        {
          title: "Láttu verða að veruleika",
          text: "Þú staðfestir — við sjáum um smáatriðin og gerum þetta eins auðvelt og mögulegt er.",
        },
      ],
    },
  }[language] ?? { kicker: "", title: "", description: "", buttonPrimary: "", buttonSecondary: "", howItWorks: "", steps: [] };

  return (
    <section data-navbar-theme="dark" className="w-full bg-[#110f0d] py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header — centered, large */}
        <div className="text-center mb-16">
          <FadeUp>
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
              <div className="w-10 sm:w-12 h-px bg-gradient-to-r from-transparent to-[#ff914d]/55" />
              <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[#ff914d] sm:tracking-[0.36em]">
                {t.kicker}
              </span>
              <div className="w-10 sm:w-12 h-px bg-gradient-to-l from-transparent to-[#ff914d]/55" />
            </div>

            <h2
              className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-6 whitespace-pre-line"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4.2rem)" }}
            >
              {t.title}
            </h2>

            <p className="max-w-lg mx-auto text-[#8a7e72] text-base leading-[1.85] mb-10">
              {t.description}
            </p>

            {/* Fade-line → primary CTA */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col items-center">
                <div className="w-px h-7 bg-gradient-to-b from-transparent to-white/10" />
                <div className="w-px h-5 bg-gradient-to-b from-transparent via-white/15 to-[#ff914d]/55" />
                <div className="w-1 h-1 rounded-full bg-[#ff914d]/65 mt-0.5" />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/whitelotus/rent"
                  className="inline-flex items-center gap-2 px-9 py-4 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide hover:scale-[1.03] hover:bg-[#ff914d]/90 transition-all duration-200 shadow-[0_2px_20px_rgba(255,145,77,0.25)]"
                >
                  {t.buttonPrimary} →
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 px-7 py-4 border border-white/20 text-[#f0ebe3] rounded-full text-sm tracking-wide hover:border-white/40 hover:text-white transition-all duration-200"
                >
                  {t.buttonSecondary}
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Divider with label */}
        <FadeUp delay={0.1}>
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.12] max-w-32" />
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[#6a5e52] sm:tracking-[0.36em]">
              {t.howItWorks}
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.12] max-w-32" />
          </div>
        </FadeUp>

        {/* Steps — watermark icons: idea → layout → confirm */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {t.steps.map((step, i) => (
            <StepCard
              key={step.title}
              num={i + 1}
              title={step.title}
              text={step.text}
              delay={0.12 + i * 0.08}
              watermark={["idea", "layout", "confirm"][i]}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
