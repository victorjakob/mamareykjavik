"use client";

import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import { PHOTOS, useMarketCopy } from "../marketData";
import { BulletList, FadeUp, SectionEyebrow } from "../MarketUi";

export default function BoothSetupSection() {
  const { language } = useLanguage();
  const { booth } = useMarketCopy(language);
  const eyebrow = language === "is" ? "Bás" : "The Booth";

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
              {booth.title}
            </h2>
          </FadeUp>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-[0.95fr_1fr_0.85fr]">
          <FadeUp delay={0.06}>
            <div
              className="rounded-2xl p-7 h-full"
              style={{
                background: "rgba(255,145,77,0.05)",
                border: "1px solid rgba(255,145,77,0.18)",
              }}
            >
              <h3
                className="font-cormorant font-light italic text-[#f0ebe3]"
                style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
              >
                {booth.included}
              </h3>
              <div className="mt-6">
                <BulletList items={booth.includedItems} />
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.12}>
            <div
              className="rounded-2xl p-7 h-full"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <h3
                className="font-cormorant font-light italic text-[#f0ebe3]"
                style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
              >
                {booth.bringOwn}
              </h3>
              <div className="mt-6">
                <BulletList items={booth.bringItems} />
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.18}>
            <div className="relative h-full min-h-[22rem] overflow-hidden rounded-sm">
              <Image
                src={PHOTOS.cacao3}
                alt="Ceremonial cacao and booth styling at White Lotus Summer Market in Reykjavík"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.04]"
              />
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
