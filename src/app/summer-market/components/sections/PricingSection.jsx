"use client";

import { HERO_VIDEO_URL, PHOTOS, useMarketCopy } from "../marketData";
import { Reveal, Section } from "../MarketUi";
import { useLanguage } from "@/hooks/useLanguage";

export default function PricingSection() {
  const { language } = useLanguage();
  const { pricing } = useMarketCopy(language);

  return (
    <Section title={pricing.title}>
      <div className="grid items-stretch gap-5 lg:grid-cols-[1.18fr_0.82fr]">
        <Reveal delay={0.08}>
          <div className="rounded-[32px] border border-[#d8c3ad] bg-[#fffaf4] p-7 shadow-[0_18px_60px_rgba(94,70,48,0.09)] sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-[#eadfd2] bg-white/90 p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-[#9a724d]">
                  {pricing.singleDay}
                </p>
                <p className="mt-3 text-3xl leading-tight text-[#20150f]">
                  {pricing.singleDayPrice}
                </p>
                <p className="mt-1 text-sm text-[#705f54]">{pricing.inclVat}</p>
                <p className="mt-5 text-sm leading-6 text-[#4e4038]">
                  {pricing.mamaDiscount}
                </p>
              </div>

              <div className="rounded-[24px] border border-[#e1d2bf] bg-[#f7efe6] p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-[#9a724d]">
                  {pricing.weekend}
                </p>
                <p className="mt-3 text-3xl leading-tight text-[#20150f]">
                  {pricing.weekendPrice}
                </p>
                <p className="mt-1 text-sm text-[#705f54]">
                  {pricing.weekendNote}
                </p>
                <p className="mt-5 text-sm leading-6 text-[#4e4038]">
                  {pricing.mamaDiscount}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-[#d8c3ad] bg-[#f3e5d4] p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-[#7c593d]">
                {pricing.reservationHeading}
              </p>
              <p className="mt-2 text-2xl text-[#20150f]">
                {pricing.reservationPrice}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#4e4038]">
                {pricing.reservationNote}
              </p>
            </div>

            <p className="mt-5 text-sm font-medium uppercase tracking-[0.18em] text-[#9a724d]">
              {pricing.feelingHeading}
            </p>
            <p className="mt-2 text-base leading-7 text-[#5e5047]">
              {pricing.feelingBody}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.16} className="h-full">
          <div className="relative h-full min-h-[21rem] overflow-hidden rounded-[32px] border border-[#eadfd2] bg-[#f7efe6] shadow-[0_12px_40px_rgba(94,70,48,0.06)]">
            <video
              autoPlay
              muted
              loop
              playsInline
              poster={PHOTOS.room2}
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src={HERO_VIDEO_URL} type="video/mp4" />
              <source src={HERO_VIDEO_URL} type="video/quicktime" />
            </video>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
