"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useMarketCopy } from "../marketData";
import { FadeUp, SectionEyebrow } from "../MarketUi";

const EASE = [0.22, 1, 0.36, 1];

export default function QuickInfoSection() {
  const { language } = useLanguage();
  const { quickInfo } = useMarketCopy(language);
  const eyebrow = language === "is" ? "Lykilatriði" : "At a glance";

  return (
    <section
      data-navbar-theme="dark"
      className="relative w-full bg-[#291f17] px-6 py-24 md:py-32"
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <SectionEyebrow align="left">{eyebrow}</SectionEyebrow>
          <FadeUp delay={0.05}>
            <h2
              className="font-cormorant font-light italic text-[#f0ebe3] leading-[1.08]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
            >
              {quickInfo.title}
            </h2>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
          {quickInfo.items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.65, delay: i * 0.05, ease: EASE }}
              className="border-t border-white/[0.08] pt-6"
            >
              <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-[#ff914d]">
                {item.title}
              </p>
              <div
                className="font-cormorant font-light text-[#f0ebe3] space-y-1"
                style={{ fontSize: "clamp(1.1rem, 1.7vw, 1.4rem)" }}
              >
                {item.content.map((line) => (
                  <p key={line} className="leading-snug">
                    {line}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
