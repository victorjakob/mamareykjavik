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
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const tileSymbols = {
  chef: "◎",
  tailor: "⟐",
  bar: "◇",
  service: "✦",
};

function FeatureTile({ icon, title, text, delay, index }) {
  return (
    <FadeUp delay={delay}>
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 hover:bg-white/[0.05] hover:border-[#ff914d]/15 transition-all duration-300 h-full">
        {/* Faded symbol in top-right */}
        <span className="absolute -top-2 -right-1 text-[5rem] leading-none font-light text-[#ff914d]/[0.04] select-none pointer-events-none">
          {tileSymbols[icon] || "✦"}
        </span>

        <div className="relative">
          <h4 className="font-cormorant text-xl font-light italic text-[#f0ebe3] mb-2">{title}</h4>
          <div className="w-8 h-px bg-gradient-to-r from-[#ff914d]/30 to-transparent mb-3" />
          <p className="text-sm text-[#a09488] leading-relaxed">{text}</p>
        </div>
      </div>
    </FadeUp>
  );
}

export default function PrivateCatering() {
  const { language } = useLanguage();

  const t = {
    en: {
      kicker: "Private chef & bar",
      title: "Your own chef\n& a tailored bar",
      description:
        "White Lotus comes with its own private chef. Tell us your vision — we'll design a menu around it. From grazing boards to full sit-down dinners, everything is crafted for your event. Paired with a curated bar built to match.",
      tagline: "Your event, your menu, your night.",
      badges: ["Private chef", "Tailored bar"],
      tiles: [
        {
          icon: "chef",
          title: "Private chef",
          text: "Our in-house chef designs a custom menu for your event — any style, any dietary need, any size.",
        },
        {
          icon: "tailor",
          title: "Fully tailored",
          text: "Dietary needs, timing, style of service — we customise everything so it feels effortless.",
        },
        {
          icon: "bar",
          title: "Curated bar",
          text: "Craft cocktails, natural wines, cacao drinks, and non-alcoholic options. Built around your night.",
        },
        {
          icon: "service",
          title: "Full service",
          text: "Setup, service, flow. You focus on your guests — we handle the rest.",
        },
      ],
    },
    is: {
      kicker: "Einkakokkur & bar",
      title: "Þinn eigin kokkur\n& sérsniðið bar",
      description:
        "White Lotus kemur með eigin einkakokk. Segðu okkur sýnina þína — við hönnuðum matseðil í kringum hana. Frá smáréttum til fullrar borðhöldskvöldverðar, allt er hannað fyrir viðburðinn þinn. Parað við vandað bar sem passar við.",
      tagline: "Þinn viðburður, þinn matseðill, þitt kvöld.",
      badges: ["Einkakokkur", "Sérsniðið bar"],
      tiles: [
        {
          icon: "chef",
          title: "Einkakokkur",
          text: "Kokkurinn okkar hannar sérsniðinn matseðil fyrir viðburðinn þinn — hvaða stíl, hvaða mataræði, hvaða stærð.",
        },
        {
          icon: "tailor",
          title: "Sérsniðið fyrir þig",
          text: "Mataræði, tímasetningar, þjónustustíll — við aðlögum allt svo það líður eðlilegt.",
        },
        {
          icon: "bar",
          title: "Vandaður bar",
          text: "Handverkskoktelar, náttúruvín, kakódrykkir og alkóhóllausar valkostur. Hannað í kringum kvöldið þitt.",
        },
        {
          icon: "service",
          title: "Heildarlausn",
          text: "Uppsetning, þjónusta, flæði. Þú einbeitir þér að gestunum — við sjáum um það sem eftir er.",
        },
      ],
    },
  }[language] ?? { kicker: "", title: "", description: "", tagline: "", badges: [], tiles: [] };

  return (
    <section data-navbar-theme="dark" className="w-full bg-[#110f0d] py-24 md:py-28 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-start">

        {/* Left — copy */}
        <div className="lg:col-span-5">
          <FadeUp>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
              <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">{t.kicker}</span>
            </div>
            <h2
              className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-6 whitespace-pre-line"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              {t.title}
            </h2>
            <div className="w-10 h-px bg-[#ff914d]/40 mb-6" />
            <p className="text-[#a09488] text-base leading-[1.85] mb-5">
              {t.description}
            </p>
            <p className="text-[#6a5e54] text-sm italic mb-8 border-l-2 border-[#ff914d]/25 pl-4">
              {t.tagline}
            </p>
            <div className="flex gap-2 flex-wrap">
              {t.badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-[#ff914d]/20 bg-[#ff914d]/[0.05] px-4 py-1.5 text-xs text-[#c09a78] tracking-wide"
                >
                  {b}
                </span>
              ))}
            </div>
          </FadeUp>
        </div>

        {/* Right — tiles */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {t.tiles.map((tile, i) => (
            <FeatureTile key={tile.title} {...tile} delay={i * 0.08} />
          ))}
        </div>

      </div>
    </section>
  );
}
