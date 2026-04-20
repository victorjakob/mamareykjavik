"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";

function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function BenefitCard({ icon, title, line, delay }) {
  return (
    <FadeUp delay={delay} className="group">
      <div
        className="relative h-full overflow-hidden rounded-2xl p-8 md:p-10 transition-all duration-400"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "none" }}
      >
        {/* Faded symbol in top-right */}
        <span className="absolute -top-2 -right-1 text-[5rem] leading-none font-light text-white/[0.04] select-none pointer-events-none">
          {icon}
        </span>

        <div className="relative">
          <h3 className="font-cormorant text-xl font-light italic text-[#f0ebe3] mb-2">{title}</h3>
          <div className="w-8 h-px bg-gradient-to-r from-[#ff914d]/30 to-transparent mb-3" />
          <p className="text-sm text-[#8a7e72] leading-relaxed">{line}</p>
        </div>
      </div>
    </FadeUp>
  );
}

export default function VenueBenefits() {
  const { language } = useLanguage();

  const t = {
    en: {
      kicker: "Why it feels right",
      title: "Great atmosphere,\neasy to host.",
      cards: [
        {
          icon: "◎",
          title: "Intimate & refined",
          line: "A space that feels warm and human from the moment you walk in — premium quality without being stiff or corporate.",
        },
        {
          icon: "⟡",
          title: "Flexible layout",
          line: "Rearrange quickly to fit your format. Works equally well for 20 guests at a workshop or 150 on a dance floor.",
        },
        {
          icon: "✦",
          title: "Pro sound & light",
          line: "Professional-grade audio, microphones, mixer, projector, and stage lighting. Ready to go — no surprises on the night.",
        },
      ],
    },
    is: {
      kicker: "Af hverju þetta virkar",
      title: "Gott andrúmsloft,\nauðvelt að halda viðburð.",
      cards: [
        {
          icon: "◎",
          title: "Hlýlegt & vandað",
          line: "Rými sem gefur hlýju og gæði strax — faglegt en aldrei stíft eða fyrirtækjalegt.",
        },
        {
          icon: "⟡",
          title: "Sveigjanlegt rými",
          line: "Uppröðun breytist á skömmum tíma. Hentar jafn vel fyrir 20 gesti á vinnustofu og 150 á dansviðburð.",
        },
        {
          icon: "✦",
          title: "Fagleg tækni",
          line: "Hágæða hljóð, míkrafónn, mixer, skjávarpi og svið- og diskóljós. Tilbúið — engar óvæntar hindranir á kvöldinu.",
        },
      ],
    },
  }[language] ?? { kicker: "Why it feels right", title: "Great atmosphere,\neasy to host.", cards: [] };

  return (
    <section data-navbar-theme="dark" className="w-full bg-[#0e0b08] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeUp>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/40" />
            <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">{t.kicker}</span>
          </div>
          <h2
            className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-16 whitespace-pre-line"
            style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)" }}
          >
            {t.title}
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {t.cards.map((card, i) => (
            <BenefitCard key={card.title} {...card} index={i} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}
