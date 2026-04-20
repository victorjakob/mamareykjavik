"use client";

import Image from "next/image";
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
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function WhatWeOffer() {
  const { language } = useLanguage();

  const translations = {
    en: {
      kicker: "What we offer",
      title: "What We Offer",
      paragraph1:
        "Mama is a 100% plant-based restaurant, serving high-quality, nourishing, and world wide inspired dishes. Our menu is designed to delight the senses while supporting personal well-being and environmental consciousness. But food is just one part of our mission.",
      paragraph2:
        "Alongside our restaurant, we host a variety of events that inspire and uplift, including music nights, art showcases, wellness workshops, and community gatherings. Ceremonial cacao and mindful drinks are part of how we welcome people — simple, nourishing, and rooted in intention.",
    },
    is: {
      kicker: "Það sem við bjóðum",
      title: "Það sem við bjóðum",
      paragraph1:
        "Mama er veitingastaður sem byggir á 100% jurtafæði og býður upp á hágæða, næringarríka og alþjóðlega innblásna rétti. Matseðillinn okkar er hannaður til að gleðja skynfærin og styðja jafnframt við persónulega vellíðan og umhverfisvitund. En matur er aðeins einn hluti af markmiði okkar.",
      paragraph2:
        "Samhliða veitingastaðnum okkar höldum við fjölbreytta viðburði sem veita innblástur og gleði, þar á meðal tónlistarkvöld, listasýningar, vellíðunarnámskeið og samkomur fyrir samfélagið. Helgist kakó og meðvitaðir drykkir eru hluti af því hvernig við bjóðum fólki inn — einfalt, næringarríkt og rætur í fyrirhyggju.",
    },
  };

  const t = translations[language];

  return (
    <section data-navbar-theme="dark" className="w-full bg-[#1a1208] pt-12 pb-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

        {/* Text */}
        <div className="space-y-6 order-1">
          <FadeUp>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
              <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">{t.kicker}</span>
            </div>
            <h2
              className="font-cormorant font-light italic text-[#f0ebe3] leading-tight"
              style={{ fontSize: "clamp(2.2rem, 4vw, 3.6rem)" }}
            >
              {t.title}
            </h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <p className="text-[#a09488] text-base md:text-lg leading-[1.85]">{t.paragraph1}</p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <p className="text-[#8a7e72] text-base leading-[1.85]">{t.paragraph2}</p>
          </FadeUp>
        </div>

        {/* Image */}
        <FadeUp delay={0.08} className="order-2">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2FIMG_0947.jpeg?alt=media&token=8b852b13-1ae7-4702-a670-269138d271c5"
              alt="Mama Restaurant Offerings"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </FadeUp>

      </div>
    </section>
  );
}
