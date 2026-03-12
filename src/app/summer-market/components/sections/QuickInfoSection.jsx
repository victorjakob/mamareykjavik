"use client";

import { highlights } from "../marketData";
import { Section, SoftCard } from "../MarketUi";

export default function QuickInfoSection() {
  return (
    <Section title="Quick Info">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {highlights.map((item, index) => (
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
