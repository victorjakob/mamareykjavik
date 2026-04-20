"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import TiltHover3D from "@/app/components/ui/TiltHover3D";

function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function WhatYouCanHost() {
  const { language } = useLanguage();

  const t = {
    en: {
      kicker: "The possibilities",
      title: "Built to hold\nany kind of gathering.",
      subtitle:
        "Concerts, cacao ceremonies, yoga mornings, dance nights, gallery openings, corporate dinners — White Lotus doesn't specialise in just one thing. That's the point.",
      cta: "Rent the Venue",
      featured: [
        {
          icon: "◈",
          label: "DJ Nights & Dancing",
          note: "Full PA · dance floor for 150 · stage lighting",
        },
        {
          icon: "♩",
          label: "Live Music & Concerts",
          note: "Warm acoustics · monitor mix · professional stage",
        },
        {
          icon: "◎",
          label: "Ceremonies & Rituals",
          note: "Cacao · breathwork · yoga · sacred space",
        },
        {
          icon: "✦",
          label: "Talks & Workshops",
          note: "Projector · microphone · cultural gatherings",
        },
        {
          icon: "◇",
          label: "Private Celebrations",
          note: "Birthdays · graduations · milestones",
        },
        {
          icon: "⟡",
          label: "Corporate & Brand Events",
          note: "Product launches · team evenings · presentations",
        },
      ],
      more: [
        "Art Exhibitions",
        "Film Screenings",
        "Pop-ups & Markets",
        "Fashion Shows",
        "Healing Circles",
        "… and so much more",
      ],
    },
    is: {
      kicker: "Möguleikarnir",
      title: "Hannað til að halda\nhvern konar samkomu.",
      subtitle:
        "Tónleikar, kakóathafnir, jóga-morg­unn, dansnætur, listasýningar, fyrirtækjakvöld — White Lotus sérhæfir sig ekki í einu. Það er tilgangurinn.",
      cta: "Leigja Salinn",
      featured: [
        {
          icon: "◈",
          label: "DJ-kvöld og dans",
          note: "Fullkomið hljóðkerfi · dansgólf fyrir 150 · svið",
        },
        {
          icon: "♩",
          label: "Tónleikar og lifandi tónlist",
          note: "Hlý hljóðvist · monitor mix · fagleg sviðsuppsetning",
        },
        {
          icon: "◎",
          label: "Athafnir og helgisiðir",
          note: "Kakó · öndun · jóga · heilagt rými",
        },
        {
          icon: "✦",
          label: "Fyrirlestrar og vinnustofur",
          note: "Skjávarpi · hljóðnemi · menningarviðburðir",
        },
        {
          icon: "◇",
          label: "Einkasamkvæmi og veislur",
          note: "Afmæli · útskriftir · tímamót",
        },
        {
          icon: "⟡",
          label: "Fyrirtækja- og vörumerkjakvöld",
          note: "Vörukynnin · liðskvöld · kynningarfundir",
        },
      ],
      more: [
        "Listasýningar",
        "Kvikmyndakvöld",
        "Pop-up og markaðir",
        "Tíska og fyrirsætukvöld",
        "Lækningarhringir",
        "… og margt fleira",
      ],
    },
  }[language] ?? { kicker: "", title: "", subtitle: "", cta: "", featured: [], more: [] };

  return (
    <section className="w-full bg-[#1a1208] py-24 md:py-32 px-6" data-navbar-theme="dark">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <FadeUp>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
            <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">{t.kicker}</span>
          </div>
          <h2
            className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-6 whitespace-pre-line"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }}
          >
            {t.title}
          </h2>
        </FadeUp>

        <FadeUp delay={0.08}>
          <p className="text-[#8a7e72] text-base md:text-lg leading-[1.8] mb-16 max-w-2xl">
            {t.subtitle}
          </p>
        </FadeUp>

        {/* Featured event types — 2-col grid with descriptions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {t.featured.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="h-full min-h-0"
            >
              <TiltHover3D
                className="h-full"
                innerClassName="group flex h-full items-start gap-4 px-5 py-4 rounded-2xl border border-[#f0ebe3]/[0.07] bg-[#f0ebe3]/[0.025] hover:border-[#ff914d]/30 hover:bg-[#ff914d]/[0.04] transition-all duration-250"
                maxTilt={8}
              >
                <span className="text-[#ff914d]/55 text-base mt-0.5 group-hover:text-[#ff914d] transition-colors duration-200 shrink-0">
                  {cat.icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-[#e0d8d0] group-hover:text-[#f0ebe3] transition-colors duration-200 mb-1">
                    {cat.label}
                  </p>
                  <p className="text-xs text-[#6a5e54] leading-relaxed">{cat.note}</p>
                </div>
              </TiltHover3D>
            </motion.div>
          ))}
        </div>

        {/* Secondary tags — smaller overflow */}
        <FadeUp delay={0.35}>
          <div className="flex flex-wrap gap-2 mb-14">
            {t.more.map((tag, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full border border-[#f0ebe3]/[0.07] text-xs text-[#7a6e64] tracking-wide hover:border-[#ff914d]/25 hover:text-[#a09488] transition-all duration-200 cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </FadeUp>

        {/* CTA */}
        <FadeUp delay={0.4}>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-start gap-0">
              <div className="w-px h-6 bg-gradient-to-b from-transparent to-[#f0ebe3]/10" />
              <div className="w-px h-4 bg-gradient-to-b from-[#f0ebe3]/10 via-[#f0ebe3]/15 to-[#ff914d]/50" />
              <div className="w-1 h-1 rounded-full bg-[#ff914d]/60 mt-0.5" />
            </div>
            <Link
              href="/whitelotus/rent"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide hover:scale-[1.03] hover:bg-[#ff914d]/90 transition-all duration-200 shadow-[0_0_28px_rgba(255,145,77,0.22)]"
            >
              {t.cta} →
            </Link>
          </div>
        </FadeUp>

      </div>
    </section>
  );
}
