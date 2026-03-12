"use client";

import { CONTACT_EMAIL, CONTACT_MAILTO } from "../marketData";
import { CTAButton, Reveal, Section } from "../MarketUi";

export default function QuestionsSection() {
  return (
    <Section title="Questions?">
      <div className="mx-auto max-w-2xl">
        <Reveal delay={0.08}>
          <div className="rounded-[30px] border border-[#eadfd2] bg-white/82 p-7 text-center shadow-[0_12px_40px_rgba(94,70,48,0.05)]">
            <p className="text-3xl text-[#20150f]">Leon</p>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-[#8f6f4f]">
              Market Host
            </p>

            <div className="mt-6 space-y-6 text-base leading-7 text-[#4e4038]">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[#8f6f4f]">
                  Phone / WhatsApp
                </p>
                <p className="mt-2">+354 6167855</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[#8f6f4f]">
                  Email
                </p>
                <p className="mt-2">{CONTACT_EMAIL}</p>
              </div>
            </div>

            <div className="mt-7">
              <CTAButton href={CONTACT_MAILTO} variant="secondary">
                Email Us
              </CTAButton>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
