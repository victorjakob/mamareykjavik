"use client";

import { useLanguage } from "@/hooks/useLanguage";
import {
  APPLY_FORM_URL,
  CONTACT_EMAIL,
  CONTACT_MAILTO,
  useMarketCopy,
} from "../marketData";
import { CTAButton, FadeUp } from "../MarketUi";

export default function ClosingSection() {
  const { language } = useLanguage();
  const { closing, questions } = useMarketCopy(language);
  const eyebrow = language === "is" ? "Velkomin" : "Welcome";
  const venueLine =
    language === "is"
      ? "White Lotus · Bankastræti 2 · Reykjavík"
      : "White Lotus · Bankastræti 2 · Reykjavík";

  return (
    <section
      data-navbar-theme="dark"
      className="relative w-full bg-[#0e0b08] px-6 py-28 md:py-36"
    >
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <FadeUp>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/45" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#ff914d]">
              {eyebrow}
            </span>
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/45" />
          </div>
        </FadeUp>

        <FadeUp delay={0.05}>
          <p
            className="font-cormorant font-light italic text-[#f0ebe3] leading-[1.2] mb-7"
            style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)" }}
          >
            &ldquo;{closing.p1}&rdquo;
          </p>
        </FadeUp>

        <FadeUp delay={0.12}>
          <p className="text-base sm:text-lg leading-[1.9] text-[#a09488] mb-12">
            {closing.p2}
          </p>
        </FadeUp>

        <FadeUp delay={0.18}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <CTAButton href={APPLY_FORM_URL}>
              {language === "is" ? "Sæktu um bás" : "Apply as Vendor"}
            </CTAButton>
            <CTAButton href={CONTACT_MAILTO} variant="secondary">
              {questions.emailCta}
            </CTAButton>
          </div>
        </FadeUp>

        {/* Footer-style facts row */}
        <FadeUp delay={0.24}>
          <div className="border-t border-white/[0.08] pt-10">
            <p className="text-xs uppercase tracking-[0.32em] text-[#6a5e52] mb-4">
              {questions.hostName} · {questions.hostRole}
            </p>
            <p className="text-sm text-[#a09488] mb-1">
              <a
                href="tel:+3546167722"
                className="hover:text-[#f0ebe3] transition-colors"
              >
                +354 616 7722
              </a>
              <span className="text-[#554e43] mx-3">·</span>
              <a
                href={CONTACT_MAILTO}
                className="hover:text-[#f0ebe3] transition-colors"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.35em] text-[#6a5e52]">
              {venueLine}
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
