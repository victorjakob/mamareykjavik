"use client";

import { APPLY_FORM_URL, PHOTOS, useMarketCopy } from "../marketData";
import { CTAButton, PhotoCard, Section } from "../MarketUi";
import { useLanguage } from "@/hooks/useLanguage";
import { localizeHref } from "@/lib/i18n-routing";
import { usePathname } from "next/navigation";

export default function ApplySection() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const { apply } = useMarketCopy(language);
  const applyHref = localizeHref(pathname, APPLY_FORM_URL);

  return (
    <Section id="apply" title={apply.title}>
      <div className="flex flex-col items-center gap-6 rounded-[34px] border border-[#d8c3ad] bg-[linear-gradient(180deg,rgba(255,250,244,1),rgba(246,236,223,1))] p-7 shadow-[0_18px_60px_rgba(94,70,48,0.08)] sm:p-9">
        <p className="max-w-2xl text-center text-base leading-7 text-[#5e5047] sm:text-lg">
          {apply.lead}
        </p>

        <CTAButton href={applyHref}>{apply.cta}</CTAButton>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PhotoCard
            src={PHOTOS.event2}
            alt="Soft crowd and movement inside White Lotus"
            className="h-56 sm:col-span-2 sm:h-72 lg:h-64"
            delay={0.1}
          />
          <PhotoCard
            src={PHOTOS.event3}
            alt="Cacao detail"
            className="h-56 sm:h-72 lg:h-64"
            delay={0.18}
          />
          <PhotoCard
            src={PHOTOS.event4}
            alt="Market detail at White Lotus"
            className="h-56 sm:h-72 lg:h-64"
            delay={0.26}
          />
        </div>
      </div>
    </Section>
  );
}
