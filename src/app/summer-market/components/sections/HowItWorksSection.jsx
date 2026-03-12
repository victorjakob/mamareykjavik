"use client";

import { steps } from "../marketData";
import { Reveal, Section } from "../MarketUi";

export default function HowItWorksSection() {
  return (
    <Section title="How It Works">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <Reveal key={step.number} delay={index * 0.07}>
            <article className="rounded-[28px] border border-[#eadfd2] bg-white/80 p-6 shadow-[0_12px_36px_rgba(94,70,48,0.05)]">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#9a724d]">
                {step.number}
              </p>
              <h3 className="mt-4 text-2xl text-[#20150f]">{step.title}</h3>
              <p className="mt-3 text-base leading-7 text-[#5e5047]">
                {step.description}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
