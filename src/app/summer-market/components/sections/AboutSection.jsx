"use client";

import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import { PHOTOS, useMarketCopy } from "../marketData";
import { FadeUp, SectionEyebrow } from "../MarketUi";

export default function AboutSection() {
  const { language } = useLanguage();
  const t = useMarketCopy(language);
  const { about } = t;
  const eyebrow = language === "is" ? "Markaðurinn" : "The Market";

  return (
    <section
      data-navbar-theme="dark"
      className="relative w-full bg-[#1f1712] px-6 py-24 md:py-36"
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-12 lg:gap-20 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div>
            <SectionEyebrow align="left">{eyebrow}</SectionEyebrow>
            <FadeUp delay={0.05}>
              <h2
                className="font-cormorant font-light italic text-[#f0ebe3] leading-[1.08] mb-8"
                style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}
              >
                {about.title}
              </h2>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className="text-base sm:text-lg leading-[1.9] text-[#a09488] mb-5">
                {about.p1}
              </p>
            </FadeUp>
            <FadeUp delay={0.16}>
              <p className="text-base sm:text-lg leading-[1.9] text-[#a09488]">
                {about.p2}
              </p>
            </FadeUp>
          </div>

          <FadeUp delay={0.2}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image
                src={PHOTOS.room4}
                alt="White Lotus Summer Market interior at Bankastræti 2 — handmade goods on display in downtown Reykjavík"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[#1f1712]/60 via-transparent to-transparent"
              />
            </div>
          </FadeUp>
        </div>

        {/* Photo strip */}
        <div className="mt-16 grid grid-cols-3 gap-3 sm:gap-4">
          {[PHOTOS.room5, PHOTOS.room6, PHOTOS.room1].map((src, i) => (
            <FadeUp delay={0.05 + i * 0.06} key={src}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                <Image
                  src={src}
                  alt={`White Lotus weekend market in Reykjavík — vendor space ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.04]"
                />
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
