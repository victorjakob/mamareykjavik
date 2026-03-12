"use client";

import { APPLY_FORM_URL, PHOTOS } from "../marketData";
import { CTAButton, PhotoCard, Section } from "../MarketUi";

export default function ApplySection() {
  return (
    <Section id="apply" title="Apply as a Vendor">
      <div className="flex flex-col items-center gap-6 rounded-[34px] border border-[#d8c3ad] bg-[linear-gradient(180deg,rgba(255,250,244,1),rgba(246,236,223,1))] p-7 shadow-[0_18px_60px_rgba(94,70,48,0.08)] sm:p-9">
        <p className="max-w-2xl text-center text-base leading-7 text-[#5e5047] sm:text-lg">
          If your products fit the feel of the White Lotus Summer Market, we&apos;d
          love to hear from you.
        </p>

        <CTAButton href={APPLY_FORM_URL}>Apply as Vendor</CTAButton>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:h-72">
          <PhotoCard
            src={PHOTOS.event2}
            alt="Soft crowd and movement inside White Lotus"
            className="aspect-[16/9] sm:col-span-2 lg:col-span-2 lg:aspect-auto"
            delay={0.1}
          />
          <PhotoCard
            src={PHOTOS.event3}
            alt="Cacao detail"
            className="aspect-[4/5] lg:aspect-auto"
            delay={0.18}
          />
          <PhotoCard
            src={PHOTOS.event4}
            alt="Market detail at White Lotus"
            className="aspect-[4/5] lg:aspect-auto"
            delay={0.26}
          />
        </div>
      </div>
    </Section>
  );
}
