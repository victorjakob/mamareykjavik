"use client";

import { PHOTOS, useMarketCopy } from "../marketData";
import { BulletList, PhotoCard, Reveal, Section } from "../MarketUi";
import { useLanguage } from "@/hooks/useLanguage";

export default function BoothSetupSection() {
  const { language } = useLanguage();
  const { booth } = useMarketCopy(language);

  return (
    <Section title={booth.title}>
      <div className="grid items-stretch gap-5 xl:grid-cols-[0.95fr_1.05fr_0.85fr]">
        <Reveal delay={0.06}>
          <div className="rounded-[30px] border border-[#eadfd2] bg-white/82 p-7 shadow-[0_12px_40px_rgba(94,70,48,0.06)]">
            <h3 className="text-2xl text-[#20150f]">{booth.included}</h3>
            <div className="mt-5">
              <BulletList items={booth.includedItems} />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="rounded-[30px] border border-[#eadfd2] bg-[#f7f0e7] p-7 shadow-[0_12px_40px_rgba(94,70,48,0.06)]">
            <h3 className="text-2xl text-[#20150f]">{booth.bringOwn}</h3>
            <div className="mt-5">
              <BulletList items={booth.bringItems} accent="dark" />
            </div>
          </div>
        </Reveal>

        <PhotoCard
          src={PHOTOS.cacao3}
          alt="Cacao and table styling for the market"
          className="min-h-[22rem]"
          delay={0.18}
        />
      </div>
    </Section>
  );
}
