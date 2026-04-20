"use client";

import { useMarketCopy } from "../marketData";
import { Section, SoftCard } from "../MarketUi";
import { useLanguage } from "@/hooks/useLanguage";

export default function QuickInfoSection() {
  const { language } = useLanguage();
  const { quickInfo } = useMarketCopy(language);

  return (
    <Section title={quickInfo.title}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {quickInfo.items.map((item, index) => (
          <SoftCard
            key={item.title}
            title={item.title}
            content={item.content}
            delay={index * 0.06}
          />
        ))}
      </div>
    </Section>
  );
}
