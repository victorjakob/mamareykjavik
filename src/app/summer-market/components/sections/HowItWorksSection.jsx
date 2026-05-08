"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useMarketCopy } from "../marketData";
import { FadeUp, SectionEyebrow } from "../MarketUi";

const EASE = [0.22, 1, 0.36, 1];

export default function HowItWorksSection() {
  const { language } = useLanguage();
  const { how } = useMarketCopy(language);
  const eyebrow = language === "is" ? "Ferlið" : "The Process";

  return (
    <section
      data-navbar-theme="dark"
      className="relative w-full bg-[#291f17] px-6 py-24 md:py-32 overflow-hidden"
    >
      {/* Decorative watermark numeral */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-6 select-none font-cormorant font-bold italic text-white/[0.025]"
        style={{ fontSize: "clamp(10rem, 22vw, 18rem)", lineHeight: 1 }}
      >
        02
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <SectionEyebrow align="left">{eyebrow}</SectionEyebrow>
          <FadeUp delay={0.05}>
            <h2
              className="font-cormorant font-light italic text-[#f0ebe3] leading-[1.08]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
            >
              {how.title}
            </h2>
          </FadeUp>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {how.steps.map((step, i) => (
            <motion.article
              key={step.number}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: i * 0.07, ease: EASE }}
              className="rounded-2xl p-7 transition-colors duration-300 hover:border-white/12"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                className="font-cormorant font-light italic text-[#ff914d]/80 leading-none"
                style={{ fontSize: "clamp(2rem, 3.5vw, 2.6rem)" }}
              >
                {step.number}
              </p>
              <h3
                className="mt-5 font-cormorant font-light italic text-[#f0ebe3]"
                style={{ fontSize: "clamp(1.4rem, 2.2vw, 1.75rem)" }}
              >
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-[1.85] text-[#a09488]">
                {step.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
