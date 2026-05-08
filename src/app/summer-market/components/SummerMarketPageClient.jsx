"use client";

import AboutSection from "./sections/AboutSection";
import ApplySection from "./sections/ApplySection";
import BoothSetupSection from "./sections/BoothSetupSection";
import ClosingSection from "./sections/ClosingSection";
import HeroSection from "./sections/HeroSection";
import HowItWorksSection from "./sections/HowItWorksSection";
import PricingSection from "./sections/PricingSection";
import QuickInfoSection from "./sections/QuickInfoSection";

export default function SummerMarketPageClient() {
  return (
    <main
      className="relative w-full bg-[#1f1712] text-[#f0ebe3] overflow-x-hidden"
      style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}
    >
      <HeroSection />
      <AboutSection />
      <QuickInfoSection />
      <PricingSection />
      <HowItWorksSection />
      <BoothSetupSection />
      <ApplySection />
      <ClosingSection />
    </main>
  );
}
