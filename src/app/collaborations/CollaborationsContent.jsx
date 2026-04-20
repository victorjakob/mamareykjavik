"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight, Handshake, Send, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import ProfileHero from "@/app/profile/components/ProfileHero";
import PageBackground from "@/app/components/ui/PageBackground";

function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const partners = [
  {
    name: "Maul.is",
    descriptionEn:
      "Corporate catering and food delivery partner, sharing Mama's vibrant, plant-forward meals with workplaces across Iceland.",
    descriptionIs:
      "Samstarfsaðili í fyrirtækjamötuneytum og matarsendingum — deilir fjölbreyttum, plöntumiðuðum réttum Mama á vinnustöðum víðsvegar um Ísland.",
    website: "https://maul.is",
    accent: "#ff914d",
  },
];

const translations = {
  en: {
    heroEyebrow: "Community · Partners",
    heroTitle: "Collaborations",
    heroSubtitle: "Working with people who share our values",
    ctaKicker: "Become a partner",
    ctaTitle: "Let's create\nsomething together",
    ctaBody:
      "We're always looking to connect with companies and creators that align with our values — quality, sustainability, and community. If that sounds like you, we'd love to hear from you.",
    ctaButton: "Get in Touch",
    partnersKicker: "Our partners",
    partnersTitle: "Trusted collaborations",
    partnersBody:
      "We're proud to work with like-minded Icelandic companies who share our passion for quality, sustainability, and community.",
    visitSite: "Visit website",
  },
  is: {
    heroEyebrow: "Samfélag · Samstarfsaðilar",
    heroTitle: "Samstarf",
    heroSubtitle: "Vinnum með fólki sem deilir gildum okkar",
    ctaKicker: "Vertu samstarfsaðili",
    ctaTitle: "Sköpum eitthvað\nsaman",
    ctaBody:
      "Við erum alltaf að leita að fyrirtækjum og skapandi aðilum sem deila gildum okkar — gæði, sjálfbærni og samfélag. Ef þetta hljómar eins og þú, þá viljum við endilega heyra frá þér.",
    ctaButton: "Hafa samband",
    partnersKicker: "Samstarfsaðilar okkar",
    partnersTitle: "Traust samstarf",
    partnersBody:
      "Við erum stolt af samstarfi við íslensk fyrirtæki sem deila ástríðu okkar fyrir gæðum, sjálfbærni og samfélagslegum tengslum.",
    visitSite: "Heimsækja vefsíðu",
  },
};

export default function CollaborationsContent() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  return (
    <div className="min-h-screen relative">
      <PageBackground />

      <div className="relative z-10">
        <ProfileHero
          eyebrow={t.heroEyebrow}
          title={t.heroTitle}
          subtitle={t.heroSubtitle}
          compact
        />

        {/* ── Become a Partner (first) ──────────────────────────────── */}
        <section
          data-navbar-theme="light"
          className="pt-16 sm:pt-20 pb-16 px-6"
        >
          <div className="max-w-4xl mx-auto">
            <FadeUp>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
                <span className="text-xs uppercase tracking-[0.35em]" style={{ color: "#ff914d" }}>
                  {t.ctaKicker}
                </span>
              </div>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-14 items-start">
              <div className="md:col-span-3 space-y-5">
                <FadeUp delay={0.06}>
                  <h2
                    className="font-cormorant font-light italic leading-tight whitespace-pre-line"
                    style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", color: "#2c1810" }}
                  >
                    {t.ctaTitle}
                  </h2>
                </FadeUp>

                <FadeUp delay={0.12}>
                  <p className="text-base md:text-lg leading-relaxed max-w-xl" style={{ color: "#7a6a5a" }}>
                    {t.ctaBody}
                  </p>
                </FadeUp>

                <FadeUp delay={0.18}>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 mt-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:brightness-110"
                    style={{
                      background: "#ff914d",
                      boxShadow: "0 4px 20px rgba(255,145,77,0.28)",
                    }}
                  >
                    <Send className="w-4 h-4" />
                    {t.ctaButton}
                  </Link>
                </FadeUp>
              </div>

              <div className="md:col-span-2 flex flex-col gap-4">
                {[
                  { icon: Handshake, label: language === "is" ? "Gildi og traust" : "Values-aligned", sub: language === "is" ? "Sjálfbærni · Gæði · Samfélag" : "Sustainability · Quality · Community" },
                  { icon: Sparkles, label: language === "is" ? "Skapandi samvinna" : "Creative synergy", sub: language === "is" ? "Saman erum við sterkari" : "Better together than apart" },
                ].map((item, i) => (
                  <FadeUp key={item.label} delay={0.12 + i * 0.08}>
                    <div
                      className="rounded-2xl p-5"
                      style={{
                        background: "rgba(255,145,77,0.04)",
                        border: "1px solid rgba(255,145,77,0.12)",
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(255,145,77,0.10)" }}
                        >
                          <item.icon className="w-4 h-4" style={{ color: "#ff914d" }} />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: "#2c1810" }}>
                          {item.label}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed pl-11" style={{ color: "#9a8e82" }}>
                        {item.sub}
                      </p>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, #e8ddd3 20%, #e8ddd3 80%, transparent)" }} />
        </div>

        {/* ── Our Partners (second) ────────────────────────────────── */}
        <section
          data-navbar-theme="light"
          className="pt-14 sm:pt-16 pb-20 px-6"
        >
          <div className="max-w-4xl mx-auto">
            <FadeUp>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
                <span className="text-xs uppercase tracking-[0.35em]" style={{ color: "#ff914d" }}>
                  {t.partnersKicker}
                </span>
              </div>
            </FadeUp>

            <FadeUp delay={0.06}>
              <h2
                className="font-cormorant font-light italic leading-tight mb-3"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#2c1810" }}
              >
                {t.partnersTitle}
              </h2>
            </FadeUp>

            <FadeUp delay={0.1}>
              <p className="text-base leading-relaxed max-w-xl mb-10" style={{ color: "#9a7a62" }}>
                {t.partnersBody}
              </p>
            </FadeUp>

            <div className="space-y-4">
              {partners.map((partner, i) => (
                <FadeUp key={partner.name} delay={0.14 + i * 0.08}>
                  <Link
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:shadow-lg"
                    style={{
                      background: "#fefcf8",
                      border: "1.5px solid #e8ddd3",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: `${partner.accent}14`, border: `1px solid ${partner.accent}25` }}
                          >
                            <span className="font-cormorant italic text-lg font-semibold" style={{ color: partner.accent }}>
                              {partner.name.charAt(0)}
                            </span>
                          </div>
                          <h3
                            className="text-lg sm:text-xl font-semibold tracking-wide group-hover:text-[#ff914d] transition-colors duration-200"
                            style={{ color: "#2c1810" }}
                          >
                            {partner.name}
                          </h3>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed pl-12" style={{ color: "#7a6a5a" }}>
                          {language === "is" ? partner.descriptionIs : partner.descriptionEn}
                        </p>
                      </div>
                      <div className="shrink-0 mt-1">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 group-hover:border-[#ff914d]/40 group-hover:bg-[#ff914d]/8"
                          style={{ borderColor: "#e8ddd3" }}
                        >
                          <ArrowUpRight
                            className="w-4 h-4 transition-all duration-200 group-hover:text-[#ff914d] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            style={{ color: "#c0a890" }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pl-12">
                      <span
                        className="text-xs uppercase tracking-[0.2em] group-hover:text-[#ff914d] transition-colors duration-200"
                        style={{ color: "#c0a890" }}
                      >
                        {t.visitSite} →
                      </span>
                    </div>
                  </Link>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
