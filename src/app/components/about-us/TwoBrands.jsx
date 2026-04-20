"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";

function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function TwoBrands() {
  const { language } = useLanguage();

  const t = {
    en: {
      kicker: "One building. Two souls.",
      intro: "Everything we do lives under the same roof — and is driven by the same intention: conscious gathering, real nourishment, and something that stays with you long after you leave.",
      brands: [
        {
          name: "Mama Reykjavík",
          type: "The Restaurant",
          description: "100% plant-based, world-inspired cuisine served daily. Stews, curries, naan, and ceremonial cacao — made with intention in a space that feels like home. Open for lunch, dinner, and everything in between.",
          tags: ["Plant-based", "Daily menu", "Ceremonial cacao", "Community table"],
          cta: "Visit the Restaurant",
          href: "/restaurant",
          accent: "#ff914d",
        },
        {
          name: "White Lotus",
          type: "The Venue",
          description: "An intimate event space directly above Mama. Built for music, movement, ceremony, and celebration. DJ nights, yoga mornings, live concerts, cacao ceremonies, private events — all in the same room.",
          tags: ["150 capacity", "Pro sound & light", "Private hire", "Events"],
          cta: "Explore the Venue",
          href: "/whitelotus",
          accent: "#c9a87c",
        },
      ],
    },
    is: {
      kicker: "Ein bygging. Tvær sálir.",
      intro: "Allt sem við gerum lifir undir sama þaki — og er drifið áfram af sömu ályktun: meðvituð samkoma, raunveruleg næring og eitthvað sem lifir með þér lengi eftir að þú ferð.",
      brands: [
        {
          name: "Mama Reykjavík",
          type: "Veitingastaðurinn",
          description: "100% jurtabundinn, heimsinlegur matur borinn fram daglega. Soð, karrí, naan og helgist kakó — gert með fyrirhyggju í rými sem líður eins og heimili. Opið í hádegismat, kvöldmat og allt þar á milli.",
          tags: ["Jurtafæði", "Daglegur matseðill", "Kakóathafnir", "Samfélagsborð"],
          cta: "Heimsækja veitingastaðinn",
          href: "/restaurant",
          accent: "#ff914d",
        },
        {
          name: "White Lotus",
          type: "Rýmið",
          description: "Náið viðburðarrými beint fyrir ofan Mömmu. Byggt fyrir tónlist, hreyfingu, athöfn og fagnaður. DJ-kvöld, jóga-morgunn, tónleikar, kakóathafnir, einkaviðburðir — allt í sama herberginu.",
          tags: ["150 gestir", "Hljóð & ljós", "Einkalega leigt", "Viðburðir"],
          cta: "Skoða rýmið",
          href: "/whitelotus",
          accent: "#c9a87c",
        },
      ],
    },
  }[language] ?? { kicker: "", intro: "", brands: [] };

  return (
    <section data-navbar-theme="dark" className="w-full bg-[#1a1208] py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <FadeUp>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
            <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">{t.kicker}</span>
          </div>
          <p className="text-[#8a7e72] text-base md:text-lg leading-[1.8] max-w-2xl mb-16">
            {t.intro}
          </p>
        </FadeUp>

        {/* Two brand cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {t.brands.map((brand, i) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="relative group rounded-2xl border border-[#f0ebe3]/[0.07] bg-[#f0ebe3]/[0.025] p-8 md:p-10 hover:border-[#f0ebe3]/[0.12] hover:bg-[#f0ebe3]/[0.04] transition-all duration-300 overflow-hidden"
            >
              {/* Subtle top accent line */}
              <div
                className="absolute top-0 left-8 right-8 h-px"
                style={{ background: `linear-gradient(to right, transparent, ${brand.accent}40, transparent)` }}
              />

              {/* Type tag */}
              <p className="text-[10px] uppercase tracking-[0.4em] mb-4" style={{ color: `${brand.accent}` }}>
                {brand.type}
              </p>

              <h3
                className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-5"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}
              >
                {brand.name}
              </h3>

              <div className="w-8 h-px mb-5" style={{ background: `${brand.accent}50` }} />

              <p className="text-[#9a8e82] text-sm leading-[1.85] mb-7">{brand.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {brand.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-[10px] tracking-wide border"
                    style={{
                      borderColor: `${brand.accent}25`,
                      color: `${brand.accent}AA`,
                      backgroundColor: `${brand.accent}08`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={brand.href}
                className="inline-flex items-center gap-2 text-sm font-medium tracking-wide transition-all duration-200 group-hover:gap-3"
                style={{ color: brand.accent }}
              >
                {brand.cta} <span>→</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
