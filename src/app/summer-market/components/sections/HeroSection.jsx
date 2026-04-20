"use client";

import {
  APPLY_FORM_URL,
  PHOTOS,
  useMarketCopy,
} from "../marketData";
import { CTAButton, MoodPill, PhotoCard, Reveal, Section } from "../MarketUi";
import { useLanguage } from "@/hooks/useLanguage";

export default function HeroSection() {
  const { language } = useLanguage();
  const t = useMarketCopy(language);
  const { hero } = t;

  return (
    <Section className="pt-6 sm:pt-8">
      <div className="relative overflow-hidden rounded-[34px] border border-[#eadfd2] bg-[#f8f1e9] shadow-[0_24px_90px_rgba(94,70,48,0.10)]">
        <div className="relative grid gap-10 px-6 py-8 sm:px-10 sm:py-12 lg:grid-cols-[1.02fr_0.98fr] lg:px-14 lg:py-14">
          <div className="relative z-10 flex flex-col justify-center">
            <MoodPill
              delay={0.05}
              className="whitespace-nowrap px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
            >
              {hero.pill}
            </MoodPill>

            <Reveal delay={0.1}>
              <h1 className="mt-5 text-4xl leading-[1.02] text-[#20150f] sm:text-5xl lg:text-6xl">
                {hero.titleA}
                <span className="block">{hero.titleB}</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4e4038] sm:text-xl">
                {hero.lead}
              </p>
            </Reveal>

            <Reveal
              delay={0.2}
              className="mt-6 space-y-1 text-sm leading-7 text-[#705f54] sm:text-base"
            >
              {hero.stats.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </Reveal>

            <Reveal
              delay={0.26}
              className="mt-8 flex flex-row flex-wrap items-center gap-3"
            >
              <CTAButton href={APPLY_FORM_URL}>{hero.ctaPrimary}</CTAButton>
              <CTAButton
                variant="secondary"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("open-contact-chatbox"))
                }
              >
                {hero.ctaSecondary}
              </CTAButton>
            </Reveal>
          </div>

          <div className="relative min-h-[28rem] lg:min-h-[34rem]">
            <PhotoCard
              src={PHOTOS.event1}
              alt="Guests enjoying the White Lotus market atmosphere"
              className="absolute right-0 top-0 h-[55%] w-[78%] rotate-[2deg]"
              imgClassName="scale-[1.02]"
              priority
              delay={0.1}
            />
            <PhotoCard
              src={PHOTOS.room3}
              alt="Vendor table and market details at White Lotus"
              className="absolute left-0 top-[18%] h-[42%] w-[42%] -rotate-[5deg]"
              delay={0.18}
            />
            <PhotoCard
              src={PHOTOS.room1}
              alt="White Lotus room during a gathering"
              className="absolute bottom-0 left-[8%] h-[42%] w-[52%] rotate-[3deg]"
              delay={0.26}
            />
            <PhotoCard
              src={PHOTOS.cacao1}
              alt="Cacao at White Lotus"
              className="absolute bottom-[6%] right-[4%] h-[28%] w-[32%] -rotate-[4deg]"
              delay={0.32}
            />

            <MoodPill
              className="absolute bottom-[33%] right-[10%]"
              delay={0.35}
            >
              {hero.floatPill}
            </MoodPill>
          </div>
        </div>
      </div>
    </Section>
  );
}
