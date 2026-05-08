"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { HERO_VIDEO_URL, PHOTOS, useMarketCopy } from "../marketData";
import { FadeUp, SectionEyebrow } from "../MarketUi";

export default function PricingSection() {
  const { language } = useLanguage();
  const { pricing } = useMarketCopy(language);
  const eyebrow = language === "is" ? "Verðlagning" : "Vendor Pricing";

  return (
    <section
      data-navbar-theme="dark"
      className="relative w-full bg-[#1f1712] px-6 py-24 md:py-32"
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <SectionEyebrow align="left">{eyebrow}</SectionEyebrow>
          <FadeUp delay={0.05}>
            <h2
              className="font-cormorant font-light italic text-[#f0ebe3] leading-[1.08]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
            >
              {pricing.title}
            </h2>
          </FadeUp>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-[1.18fr_0.82fr]">
          <FadeUp delay={0.08}>
            <div
              className="rounded-2xl p-7 sm:p-9 h-full"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: "rgba(255,145,77,0.05)",
                    border: "1px solid rgba(255,145,77,0.18)",
                  }}
                >
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#ff914d]">
                    {pricing.singleDay}
                  </p>
                  <p
                    className="mt-4 font-cormorant font-light text-[#f0ebe3] leading-none"
                    style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)" }}
                  >
                    {pricing.singleDayPrice}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#6a5e52]">
                    {pricing.inclVat}
                  </p>
                  <p className="mt-6 text-sm leading-7 text-[#a09488]">
                    {pricing.mamaDiscount}
                  </p>
                </div>

                <div
                  className="rounded-xl p-6"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#ff914d]">
                    {pricing.weekend}
                  </p>
                  <p
                    className="mt-4 font-cormorant font-light text-[#f0ebe3] leading-none"
                    style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)" }}
                  >
                    {pricing.weekendPrice}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#6a5e52]">
                    {pricing.weekendNote}
                  </p>
                  <p className="mt-6 text-sm leading-7 text-[#a09488]">
                    {pricing.mamaDiscount}
                  </p>
                </div>
              </div>

              <div
                className="mt-6 rounded-xl p-6"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#ff914d]">
                  {pricing.reservationHeading}
                </p>
                <p
                  className="mt-3 font-cormorant font-light text-[#f0ebe3] leading-none"
                  style={{ fontSize: "clamp(1.4rem, 2.6vw, 1.9rem)" }}
                >
                  {pricing.reservationPrice}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#a09488]">
                  {pricing.reservationNote}
                </p>
              </div>

              <div className="mt-8 border-l-2 border-[#ff914d]/30 pl-5">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#ff914d] mb-3">
                  {pricing.feelingHeading}
                </p>
                <p className="font-cormorant italic text-[#a09488] leading-relaxed text-base">
                  {pricing.feelingBody}
                </p>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.16} className="h-full">
            <div className="relative h-full min-h-[24rem] overflow-hidden rounded-sm">
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
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[#1f1712]/55 via-transparent to-transparent"
              />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
