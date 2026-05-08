"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { localizeHref } from "@/lib/i18n-routing";
import { APPLY_FORM_URL, PHOTOS, useMarketCopy } from "../marketData";
import { CTAButton, FadeUp, SectionEyebrow } from "../MarketUi";

export default function ApplySection() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const { apply } = useMarketCopy(language);
  const applyHref = localizeHref(pathname, APPLY_FORM_URL);
  const eyebrow = language === "is" ? "Sækja um" : "Apply";

  return (
    <section
      id="apply"
      data-navbar-theme="dark"
      className="relative w-full bg-[#291f17] px-6 py-24 md:py-32"
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <SectionEyebrow align="center">{eyebrow}</SectionEyebrow>
          <FadeUp delay={0.05}>
            <h2
              className="font-cormorant font-light italic text-[#f0ebe3] leading-[1.08]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
            >
              {apply.title}
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg leading-[1.9] text-[#a09488]">
              {apply.lead}
            </p>
          </FadeUp>
          <FadeUp delay={0.16}>
            <div className="mt-9 flex justify-center">
              <CTAButton href={applyHref}>
                {apply.cta}
                <span aria-hidden className="ml-2">
                  →
                </span>
              </CTAButton>
            </div>
          </FadeUp>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[PHOTOS.event2, PHOTOS.event3, PHOTOS.event4, PHOTOS.cacao1].map(
            (src, i) => (
              <FadeUp delay={0.1 + i * 0.06} key={src}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
                  <Image
                    src={src}
                    alt={`White Lotus Summer Market atmosphere — handmade goods and gatherings in downtown Reykjavík (${i + 1})`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 hover:scale-[1.04]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-[#1f1712]/50 via-transparent to-transparent"
                  />
                </div>
              </FadeUp>
            )
          )}
        </div>
      </div>
    </section>
  );
}
