"use client";

import { PHOTOS } from "../marketData";
import { PhotoCard, Reveal, Section } from "../MarketUi";

export default function AboutSection() {
  return (
    <Section title="A gentle weekend market in the heart of Reykjavík">
      <div className="flex flex-col gap-8">
        <Reveal delay={0.08}>
          <div className="mx-auto max-w-2xl text-left text-base leading-8 text-[#5e5047] sm:text-lg lg:text-center">
            <p>
              White Lotus Summer Market brings together a small mix of makers,
              artists, healers, and independent brands in a warm upstairs space in
              downtown Reykjavík.
            </p>
            <p className="mt-6">
              People can wander in for tea, cacao, small treasures, conversation,
              and music. The feeling is intimate, relaxed, and alive — more like
              stepping into a beautiful room than walking into a trade fair.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:h-72">
          <PhotoCard
            src={PHOTOS.room4}
            alt="Beautiful objects and atmosphere inside White Lotus"
            className="aspect-[16/9] sm:col-span-2 lg:col-span-2 lg:aspect-auto"
            delay={0.1}
          />
          <PhotoCard
            src={PHOTOS.room5}
            alt="Guests gathering at White Lotus"
            className="aspect-[3/4] lg:aspect-auto"
            delay={0.18}
          />
          <PhotoCard
            src={PHOTOS.room6}
            alt="Warm details from a White Lotus gathering"
            className="aspect-[3/4] lg:aspect-auto"
            delay={0.26}
          />
        </div>
      </div>
    </Section>
  );
}
