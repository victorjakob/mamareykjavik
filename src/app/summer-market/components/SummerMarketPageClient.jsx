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
    <main className="relative overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-32">
      <div className="absolute inset-0 -z-30 bg-[#fbf7f1]" />
      <div className="absolute inset-x-0 top-0 -z-20 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(188,151,109,0.18),transparent_58%)]" />
      <div className="absolute left-[-8rem] top-[18rem] -z-20 h-72 w-72 rounded-full bg-[#ead8c5]/60 blur-3xl" />
      <div className="absolute right-[-6rem] top-[52rem] -z-20 h-80 w-80 rounded-full bg-[#f0e4d7]/80 blur-3xl" />

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
