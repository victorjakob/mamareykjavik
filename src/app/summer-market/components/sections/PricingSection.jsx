"use client";

import { HERO_VIDEO_URL, PHOTOS } from "../marketData";
import { Reveal, Section } from "../MarketUi";

export default function PricingSection() {
  return (
    <Section title="Vendor Pricing">
      <div className="grid items-stretch gap-5 lg:grid-cols-[1.18fr_0.82fr]">
        <Reveal delay={0.08}>
          <div className="rounded-[32px] border border-[#d8c3ad] bg-[#fffaf4] p-7 shadow-[0_18px_60px_rgba(94,70,48,0.09)] sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-[#eadfd2] bg-white/90 p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-[#9a724d]">
                  Single day
                </p>
                <p className="mt-3 text-3xl leading-tight text-[#20150f]">8.500 kr</p>
                <p className="mt-1 text-sm text-[#705f54]">(incl. VSK)</p>
                <p className="mt-5 text-sm leading-6 text-[#4e4038]">
                  + 20% discount in Mama
                </p>
              </div>

              <div className="rounded-[24px] border border-[#e1d2bf] bg-[#f7efe6] p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-[#9a724d]">
                  Weekend bundle
                </p>
                <p className="mt-3 text-3xl leading-tight text-[#20150f]">
                  19.000 kr
                </p>
                <p className="mt-1 text-sm text-[#705f54]">(Fri + Sat + Sun)</p>
                <p className="mt-5 text-sm leading-6 text-[#4e4038]">
                  + 20% discount in Mama
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-[#d8c3ad] bg-[#f3e5d4] p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-[#7c593d]">
                Reservation fee
              </p>
              <p className="mt-2 text-2xl text-[#20150f]">3.500 kr</p>
              <p className="mt-2 text-sm leading-6 text-[#4e4038]">
                Deducted from your booth fee.
              </p>
            </div>

            <p className="mt-5 text-sm font-medium uppercase tracking-[0.18em] text-[#9a724d]">
              The feeling
            </p>
            <p className="mt-2 text-base leading-7 text-[#5e5047]">
              Soft music playing, cacao warming the room, people meeting,
              exploring, and enjoying the moment together.
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
