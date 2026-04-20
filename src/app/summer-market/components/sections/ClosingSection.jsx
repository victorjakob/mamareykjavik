"use client";

import { Reveal, Section } from "../MarketUi";
import { useMarketCopy } from "../marketData";
import { useLanguage } from "@/hooks/useLanguage";

export default function ClosingSection() {
  const { language } = useLanguage();
  const { closing } = useMarketCopy(language);

  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <Reveal delay={0.06}>
          <div className="rounded-[30px] border border-[#eadfd2] bg-[#f7f0e7] p-7 text-center shadow-[0_12px_40px_rgba(94,70,48,0.05)]">
            <p className="text-xl leading-8 text-[#20150f] sm:text-2xl">
              {closing.p1}
            </p>
            <p className="mt-5 text-base leading-7 text-[#5e5047] sm:text-lg">
              {closing.p2}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
