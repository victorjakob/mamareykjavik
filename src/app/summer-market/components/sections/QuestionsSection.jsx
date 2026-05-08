"use client";

import { useLanguage } from "@/hooks/useLanguage";
import {
  CONTACT_EMAIL,
  CONTACT_MAILTO,
  useMarketCopy,
} from "../marketData";
import { CTAButton, FadeUp, SectionEyebrow } from "../MarketUi";

export default function QuestionsSection() {
  const { language } = useLanguage();
  const { questions } = useMarketCopy(language);
  const eyebrow = language === "is" ? "Hafa samband" : "Get in touch";

  return (
    <section
      data-navbar-theme="dark"
      className="relative w-full bg-[#1f1712] px-6 py-24 md:py-32"
    >
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <SectionEyebrow align="center">{eyebrow}</SectionEyebrow>
        <FadeUp delay={0.05}>
          <h2
            className="font-cormorant font-light italic text-[#f0ebe3] leading-[1.08]"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
          >
            {questions.title}
          </h2>
        </FadeUp>

        <FadeUp delay={0.12}>
          <div
            className="mt-12 rounded-2xl p-8 sm:p-10"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p
              className="font-cormorant font-light italic text-[#f0ebe3]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)" }}
            >
              {questions.hostName}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-[#ff914d]">
              {questions.hostRole}
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 text-left">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#6a5e52]">
                  {questions.phoneLabel}
                </p>
                <a
                  href="tel:+3546167722"
                  className="mt-2 block text-base text-[#f0ebe3] hover:text-[#ff914d] transition-colors"
                >
                  +354 616 7722
                </a>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#6a5e52]">
                  {questions.emailLabel}
                </p>
                <a
                  href={CONTACT_MAILTO}
                  className="mt-2 block text-base text-[#f0ebe3] hover:text-[#ff914d] transition-colors break-all"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <CTAButton href={CONTACT_MAILTO} variant="secondary">
                {questions.emailCta}
              </CTAButton>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
