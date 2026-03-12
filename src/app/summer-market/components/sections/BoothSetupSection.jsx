"use client";

import { bringItems, includedItems, PHOTOS } from "../marketData";
import { BulletList, PhotoCard, Reveal, Section } from "../MarketUi";

export default function BoothSetupSection() {
  return (
    <Section title="Booth Setup">
      <div className="grid items-stretch gap-5 xl:grid-cols-[0.95fr_1.05fr_0.85fr]">
        <Reveal delay={0.06}>
          <div className="rounded-[30px] border border-[#eadfd2] bg-white/82 p-7 shadow-[0_12px_40px_rgba(94,70,48,0.06)]">
            <h3 className="text-2xl text-[#20150f]">Included</h3>
            <div className="mt-5">
              <BulletList items={includedItems} />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="rounded-[30px] border border-[#eadfd2] bg-[#f7f0e7] p-7 shadow-[0_12px_40px_rgba(94,70,48,0.06)]">
            <h3 className="text-2xl text-[#20150f]">Bring Your Own</h3>
            <div className="mt-5">
              <BulletList items={bringItems} accent="dark" />
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
