"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Heart, Leaf } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

// Client body for /tribe-card — extracted so page.jsx can stay a server
// component and export proper metadata. See ../page.jsx.
//
// Locale is read from `useLanguage()`, which is hydrated from the
// `x-locale` request header via LanguageProvider in the root layout.

const COPY = {
  en: {
    eyebrow: "Mama · Tribe",
    heading: "The Tribe Card",
    heroLead:
      "A small thank-you to the people who have made Mama home — a quiet discount that follows you into the restaurant, our events, and our ceremonies.",
    intro:
      "If you have a physical Tribe Card from us, or we've told you in person that you're part of the tribe, this is your place to request your digital card. We'll send it to your email once we've approved it, and you can keep it in your Mama profile forever.",
    features: [
      { title: "Your discount", body: "15, 20 or 25% off food and events — set just for you." },
      { title: "One card, always with you", body: "Link it to your Mama profile and it lives there forever." },
      { title: "For the community", body: "A small gesture of thanks to the people who make Mama warm." },
    ],
    cta: "Request your card",
    note:
      "We'll review your request personally and get back to you within a few days.",
    requestHref: "/tribe-card/request",
  },
  is: {
    eyebrow: "Mama · Ættbálkur",
    heading: "Ættbálkurkortið",
    heroLead:
      "Lítill þakklætisvottur til fólksins sem hefur gert Mama að heimili — hljóðlátur afsláttur sem fylgir þér á veitingastaðinn, á viðburði okkar og í athafnir.",
    intro:
      "Ef þú átt Ættbálkurkort frá okkur, eða við höfum sagt þér persónulega að þú sért hluti af ættbálknum, þá er þetta staðurinn til að sækja um stafræna kortið þitt. Við sendum það í tölvupóst þegar við höfum samþykkt það, og þú getur geymt það í Mama prófílnum þínum að eilífu.",
    features: [
      { title: "Þinn afsláttur", body: "15, 20 eða 25% af mat og viðburðum — sérstillt fyrir þig." },
      { title: "Eitt kort, alltaf með þér", body: "Tengdu það við Mama prófílinn þinn og það lifir þar að eilífu." },
      { title: "Fyrir samfélagið", body: "Lítill vottur um þakkir til fólksins sem gerir Mama hlýtt." },
    ],
    cta: "Sækja um kortið þitt",
    note:
      "Við förum yfir beiðnina persónulega og svörum þér innan fárra daga.",
    requestHref: "/is/tribe-card/request",
  },
};

export default function TribeCardLandingClient() {
  const { language } = useLanguage();
  const t = COPY[language === "is" ? "is" : "en"];
  const featureIcons = [Sparkles, Heart, Leaf];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff6ea] via-white to-[#f5efe6]">
      {/* Dark warm hero — gives the white navbar a dark background to sit on. */}
      <section
        data-navbar-theme="dark"
        className="relative overflow-hidden bg-gradient-to-br from-[#1a0f08] via-[#2c1810] to-[#5c2e12] pt-28 sm:pt-32 pb-14 px-5"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            background:
              "radial-gradient(circle at 22% 18%, rgba(255,145,77,0.35) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(31,92,75,0.28) 0%, transparent 55%)",
          }}
        />
        <div className="relative max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#f1c9a0] mb-2">
              {t.eyebrow}
            </p>
            <h1
              className="font-cormorant italic text-white text-4xl sm:text-5xl font-light mb-5 leading-[1.05]"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              {t.heading}
            </h1>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
              {t.heroLead}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="pb-20 px-5">
        <div className="max-w-2xl mx-auto pt-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
          >
            <p className="text-[#6a5040] text-[15px] leading-relaxed mb-10">
              {t.intro}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
              {t.features.map(({ title, body }, i) => {
                const Icon = featureIcons[i];
                return (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
                    className="rounded-2xl p-5 bg-white/80 border border-[#eadfd2] backdrop-blur-sm"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[rgba(199,106,43,0.12)] flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4 text-[#c76a2b]" strokeWidth={1.5} />
                    </div>
                    <p className="text-[#2c1810] text-sm font-semibold mb-1">{title}</p>
                    <p className="text-[#6a5040] text-[13px] leading-relaxed">{body}</p>
                  </motion.div>
                );
              })}
            </div>

            <Link
              href={t.requestHref}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-[#c76a2b] hover:bg-[#a5551f] transition-colors text-white font-semibold rounded-full text-[15px] shadow-md"
            >
              {t.cta}
            </Link>

            <p className="mt-5 text-[12px] text-[#8a7261]">
              {t.note}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
