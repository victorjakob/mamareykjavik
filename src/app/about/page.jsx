import Story from "../components/about-us/1-story";
import WhatWeOffer from "../components/about-us/2-whatWeOffer";
import Community from "../components/about-us/3-community";
import NextSteps from "../components/about-us/4-nextSteps";
import LongTermVision from "../components/about-us/5-longterm";
import BePart from "../components/about-us/6-bePart";
import Welcome from "../components/about-us/Welcome";

export default function AboutPage() {
  return (
    <main>
      <Welcome />
      <Story />
      <WhatWeOffer />
      <Community />
      <NextSteps />
      <LongTermVision />
      <BePart />
    </main>
  );
}
