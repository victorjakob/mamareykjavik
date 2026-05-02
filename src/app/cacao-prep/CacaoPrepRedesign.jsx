"use client";

import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";

// ── Images ───────────────────────────────────────────────────────────────────
const IMG_HERO =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1752238745/ceremonial-cacao-cup_twp40h.jpg";
const IMG_PLANT =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752336814/cacao-plant_r2allw.jpg";
const IMG_LOGO =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752335914/mama-cacao-logo_seug7k.png";
const IMG_BEANS =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1752239806/cacao-beans_d6fjws.jpg";
const IMG_CUP =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1752238745/ceremonial-cacao-cup_twp40h.jpg";
const IMG_THANKS =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1752239808/giving-thanks_xibufq.jpg";

// ── Translations ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    heroSub: "The Art of Making",
    heroTitle: "Ceremonial Cacao",
    heroDesc: "A sacred cup to awaken your heart and centre your spirit.",
    heroQuote: "The food of the gods.",
    introLabel: "About cacao",
    introSub: "What is ceremonial cacao?",
    introBody:
      "Ceremonial cacao is pure, minimally processed cacao — far from chocolate or cocoa powder. For thousands of years, the peoples of Central America have honoured it as a sacred plant medicine to open the heart, sharpen focus, and connect body and spirit. It is gentle, warm, and quietly profound.",
    introBody2:
      "When held with intention, a cup of cacao becomes less about what you drink and more about how you arrive — softer, steadier, more present.",
    introPoints: [
      { label: "Origin", value: "Small farms · Central America" },
      { label: "Form", value: "100% pure cacao paste" },
      { label: "Purpose", value: "Heart · meditation · community" },
    ],
    processLabel: "The Preparation",
    processSub: "How to prepare your cacao",
    processBody:
      "A simple ritual — a few ingredients, a few minutes, a steady hand. Below is everything you'll need and every step to prepare a sacred cup at home.",
    ingLabel: "Ingredients",
    ingSub: "What you will need",
    ingItems: [
      { main: "20–40g ceremonial cacao", note: "finely chopped or grated" },
      {
        main: "100–200ml spring water or plant-based milk",
        note: "adjust to your desired thickness",
      },
    ],
    optLabel: "Optional additions",
    optItems: [
      "Maple syrup, coconut sugar, or raw honey",
      "A small spoon of coconut oil",
      "Cinnamon · Cayenne · Cardamom · Vanilla · Rose petals · Pinch of salt",
    ],
    ingNote:
      "Each ingredient is part of the medicine. Feel into what your body is calling for — trust your intuition.",
    prepLabel: "The Method",
    prepSub: "Step by step",
    prepSteps: [
      "Chop the cacao finely.",
      "Warm the water gently — do not let it boil.",
      "Add water slowly to the cacao on low heat, creating a paste and slowly finding the right consistency.",
      "Mix in spices of your choice.",
      "Blend if you like it frothy — this activates the texture beautifully. Step 3 is not necessary if you use a blender.",
      "Pour into your favourite cup and receive the medicine.",
    ],
    sacredLabel: "The Ceremony",
    sacredSub: "Make it sacred",
    sacredIntro:
      "When you prepare cacao for use in a ceremony, make the preparation a ritual itself.",
    sacredPoints: [
      "Be mindful of why you are preparing your cacao.",
      "Take your time — there is nowhere to rush to.",
      "Send your prayers and intentions to the drink as you make it.",
      "Hold love in your heart as you do.",
      "Serve it in your favourite mug or ceremonial cup.",
    ],
    faqLabel: "Questions",
    faqSub: "Common questions about ceremonial cacao",
    faqItems: [
      {
        q: "What is ceremonial cacao?",
        a: "It is pure, minimally processed cacao — not cocoa powder or chocolate — traditionally used in sacred ceremonies to open the heart, increase focus, and connect spirit and body.",
      },
      {
        q: "Is it safe for everyone?",
        a: "Cacao is a gentle heart medicine, but those who are pregnant, on antidepressants (especially MAOIs or SSRIs), or with heart conditions should start with a small amount and consult their practitioner.",
      },
      {
        q: "How much should I drink?",
        a: "For a ceremony, 30–40g is common. For daily use, 10–20g is beautiful. Always listen to your body — less is often more.",
      },
      {
        q: "Can I buy cacao at the restaurant?",
        a: "Yes! We serve and sell ceremonial cacao at Mama. You can also order online or join a cacao ceremony to experience it in community.",
      },
      {
        q: "What makes Mama Cacao special?",
        a: "Our cacao is sourced from small farms in Central America with love and respect for the land, hand-prepared and blessed to carry the medicine of connection.",
      },
    ],
    ctaLabel: "Go deeper",
    ctaSub: "Want to go deeper?",
    ctaJoin: "Join our events",
    ctaPrivate: "Book a Private Ceremony",
    ctaOrder: "Order Ceremonial Cacao",
    ctaQuote:
      "Every cup of cacao is a prayer in motion — a reminder that the simplest acts can be sacred.",
  },
  is: {
    heroSub: "Listin að skapa",
    heroTitle: "Seramóniu kakó",
    heroDesc: "Hinn heilagi drykkur sem opnar hjartað og miðjar andann þinn.",
    heroQuote: "Fæða guðanna.",
    introLabel: "Um kakóið",
    introSub: "Hvað er seramóníu kakó?",
    introBody:
      "Seramóníu kakó er hreint, lítið unnið kakó — fjarri súkkulaði eða kakódufti. Í þúsundir ára hafa þjóðirnar í Mið-Ameríku heiðrað það sem helga plöntulækningu sem opnar hjartað, skerpir einbeitingu og tengir líkama og anda. Mýkt, hlýtt og djúpt — á lágstemmdan hátt.",
    introBody2:
      "Þegar það er nálgast með ásetningi verður bolli af kakó ekki svo mikið um hvað þú drekkur, heldur hvernig þú mætir — mýkri, stöðugri, meira til staðar.",
    introPoints: [
      { label: "Uppruni", value: "Smábændur · Mið-Ameríka" },
      { label: "Form", value: "100% hreint kakómauk" },
      { label: "Tilgangur", value: "Hjarta · hugleiðsla · samfélag" },
    ],
    processLabel: "Undirbúningurinn",
    processSub: "Hvernig á að útbúa kakóið þitt",
    processBody:
      "Einfaldur helgisiður — fá innihaldsefni, nokkrar mínútur, róleg hönd. Hér að neðan er allt sem þú þarft og hvert skref til að útbúa heilagan bolla heima.",
    ingLabel: "Innihald",
    ingSub: "Það sem þú þarft",
    ingItems: [
      { main: "20–40g seramóníu kakó", note: "fínt saxað" },
      {
        main: "100–200ml vatn eða jurtamjólk",
        note: "eftir því hversu þykkt þú vilt hafa það",
      },
    ],
    optLabel: "Valfrjálsar viðbætur",
    optItems: [
      "Hlynsíróp, kókossykur eða hráhunang",
      "Lítil skeið af kókosolíu",
      "Kanill · Cayenne · Kardimomma · Vanilla · Rósablöð · Smá salt",
    ],
    ingNote:
      "Hvert innihaldsefni er hluti af lækningunni. Finndu hvað líkaminn þinn kallar á — treystu innsæinu þínu.",
    prepLabel: "Aðferðin",
    prepSub: "Skref fyrir skref",
    prepSteps: [
      "Saxaðu kakóið fínt.",
      "Hitaðu vatnið varlega — láttu það ekki sjóða.",
      "Bætið vatninu smám saman við kakóið á lágum hita þar til þú færð mjúka og fallega áferð.",
      "Bættu við kryddum að eigin vali.",
      "Blandaðu í blandara ef þú vilt froðukennda áferð. (Þú getur sleppt þrepi 3 ef þú notar blandara.)",
      "Helltu í uppáhalds bollann þinn og taktu við lækningunni.",
    ],
    sacredLabel: "Athöfnin",
    sacredSub: "Gerðu það helgað",
    sacredIntro:
      "Þegar þú útbýrð kakó fyrir athöfn, gerðu sjálfa undirbúninginn að helgisið.",
    sacredPoints: [
      "Vertu meðvituð/ur um ástæðuna fyrir því að þú útbýrð kakóið.",
      "Gefðu þér tíma — engin þörf á að flýta sér.",
      "Sendu bænir og ásetning þinn inn í drykkinn á meðan þú útbýrð hann.",
      "Haltu ást í hjartanu meðan þú gerir það.",
      "Berðu það fram í uppáhalds bollanum þínum.",
    ],
    faqLabel: "Spurningar",
    faqSub: "Algengar spurningar um seramóníu kakó",
    faqItems: [
      {
        q: "Hvað er athafnacacao?",
        a: "Það er hreint, lítillega unnið kakó — ekki kakóduft eða súkkulaði — hefðbundið notað í helgisiðir til að opna hjartað, auka einbeitingu og tengja andann og líkamann.",
      },
      {
        q: "Er það öruggt fyrir alla?",
        a: "Kakó er mýkt hjartalyf, en þeir sem eru þungaðir, á hleðslueyðandi lyfjum (sérstaklega MAOIs eða SSRIs) eða með hjartasjúkdóma ættu að byrja með litlu magni og ráðfæra sig við meðferðaraðila.",
      },
      {
        q: "Hversu mikið ætti ég að drekka?",
        a: "Fyrir athöfn er 30–40g algengt. Fyrir daglegan notkun er 10–20g fallegt. Hlustaðu alltaf á líkamann þinn — minna er oft meira.",
      },
      {
        q: "Get ég keypt kakó á veitingastaðnum?",
        a: "Já! Við þjónum og seljum athafnacacao á Mama. Þú getur einnig pantað á netinu eða tekið þátt í kakóathöfn til að upplifa það í samfélagi.",
      },
      {
        q: "Hvað gerir Mama Cacao sérstakt?",
        a: "Kakóið okkar er sótt frá litlum bændum í Mið-Ameríku með ást og virðingu fyrir landinu, handunnið og blessað til að bera lyfjatengsla.",
      },
    ],
    ctaLabel: "Kafa dýpra",
    ctaSub: "Viltu kafa dýpra?",
    ctaJoin: "Taktu þátt í viðburðum okkar",
    ctaPrivate: "Bókaðu einkakakóathöfn",
    ctaOrder: "Pantaðu seramóníu kakó",
    ctaQuote:
      "Hver bolli af kakó er lifandi bæn — áminning um að einfaldustu athafnirnar geta verið helgar.",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
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

function SectionLabel({ label, sub }) {
  return (
    <FadeUp className="text-center mb-14">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
        <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">{label}</span>
        <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
      </div>
      <h2
        className="font-cormorant font-light italic text-[#f0ebe3] leading-tight"
        style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
      >
        {sub}
      </h2>
    </FadeUp>
  );
}

// ── FAQ Accordion ─────────────────────────────────────────────────────────────
function FAQ({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden transition-colors duration-300"
          style={{
            background:
              open === i
                ? "rgba(255,145,77,0.05)"
                : "rgba(255,255,255,0.025)",
            border:
              open === i
                ? "1px solid rgba(255,145,77,0.18)"
                : "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-7 py-5 text-left"
          >
            <span className="text-[#f0ebe3] text-sm font-medium leading-snug pr-4">
              {item.q}
            </span>
            <motion.span
              animate={{ rotate: open === i ? 45 : 0 }}
              transition={{ duration: 0.25 }}
              className="text-[#ff914d] text-xl flex-shrink-0"
            >
              +
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p className="px-7 pb-6 text-[#8a7e72] text-sm leading-relaxed">
                  {item.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CacaoPrepRedesign() {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const reduceMotion = useReducedMotion();

  // Hero Ken Burns + parallax
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "18%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.55], [1, 0]);

  return (
    <div className="w-full bg-[#0e0b08] text-[#f0ebe3] overflow-x-hidden">
      {/* ── 1. HERO ────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        data-navbar-theme="light"
        className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
      >
        {/* Ken Burns + parallax image */}
        <motion.div
          className="absolute inset-0"
          style={reduceMotion ? {} : { y: heroY }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1.0 }}
            transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={IMG_HERO}
              alt="Ceremonial cacao — Mama Reykjavik"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </motion.div>

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-[#0e0b08]" />

        {/* Content */}
        <motion.div
          className="relative z-10 text-center px-6 flex flex-col items-center"
          style={reduceMotion ? {} : { opacity: heroOpacity }}
        >
          {/* Cacao logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mb-7"
          >
            <Image
              src={IMG_LOGO}
              alt="Mama Cacao"
              width={88}
              height={88}
              className="object-contain mx-auto opacity-90"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="text-xs uppercase tracking-[0.4em] text-[#ff914d] mb-4"
          >
            {t.heroSub}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="font-cormorant font-light italic text-white leading-tight mb-5"
            style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)" }}
          >
            {t.heroTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="text-sm text-white/65 max-w-xs font-light tracking-wide mb-4"
          >
            {t.heroDesc}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="font-cormorant font-light italic text-[#f0ebe3]/90 mb-10 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
            style={{ fontSize: "clamp(1.2rem, 2vw, 1.6rem)" }}
          >
            &ldquo;{t.heroQuote}&rdquo;
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/events"
              className="px-9 py-3.5 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide hover:scale-[1.04] transition-all duration-200 shadow-[0_2px_20px_rgba(255,145,77,0.35)]"
            >
              {t.ctaJoin}
            </Link>
            <Link
              href="/cacao-prep/private-booking"
              className="px-9 py-3.5 border border-white/40 text-white font-semibold rounded-full text-sm tracking-wide hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
            >
              {t.ctaPrivate}
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9, duration: 1 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-px h-10 bg-gradient-to-b from-white/0 to-white/40" />
            <div className="w-1 h-1 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. INTRO — What is ceremonial cacao ───────────────────────────── */}
      <section
        data-navbar-theme="dark"
        className="relative bg-[#110f0d] py-28 px-6 overflow-hidden"
      >
        {/* Ambient glow */}
        <div className="absolute top-1/4 -left-20 w-[420px] h-[420px] rounded-full bg-[#ff914d]/[0.04] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[320px] h-[320px] rounded-full bg-[#c9b89e]/[0.03] blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <SectionLabel label={t.introLabel} sub={t.introSub} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <FadeUp>
              <div className="relative overflow-hidden rounded-2xl aspect-[4/5]">
                <Image
                  src={IMG_PLANT}
                  alt="Cacao plant — Theobroma cacao"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#110f0d]/60 via-transparent to-transparent" />
              </div>
            </FadeUp>

            {/* Text */}
            <div className="space-y-7">
              <FadeUp>
                <p className="text-[#c4b8aa] text-base md:text-lg leading-relaxed font-light">
                  {t.introBody}
                </p>
              </FadeUp>
              <FadeUp delay={0.08}>
                <p className="font-cormorant italic text-[#d8c8a8] text-lg md:text-xl leading-relaxed">
                  {t.introBody2}
                </p>
              </FadeUp>
              <FadeUp delay={0.16}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {t.introPoints.map((p) => (
                    <div
                      key={p.label}
                      className="p-5 rounded-xl"
                      style={{
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#ff914d]/80 mb-1.5">
                        {p.label}
                      </p>
                      <p className="text-[#f0ebe3] text-sm leading-snug">
                        {p.value}
                      </p>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. PROCESS INTRO — chapter opener ──────────────────────────────── */}
      <section
        data-navbar-theme="dark"
        className="relative bg-[#0e0b08] border-t border-white/[0.05] py-20 px-6 text-center overflow-hidden"
      >
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden
        >
          <span
            className="font-cormorant font-light italic text-white/[0.025]"
            style={{ fontSize: "clamp(9rem, 20vw, 16rem)", lineHeight: 1 }}
          >
            01
          </span>
        </div>

        <div className="relative max-w-2xl mx-auto">
          <FadeUp>
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
              <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">
                {t.processLabel}
              </span>
              <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
            </div>
            <h2
              className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-6"
              style={{ fontSize: "clamp(2.25rem, 5.5vw, 4rem)" }}
            >
              {t.processSub}
            </h2>
            <p className="text-[#a09488] text-base md:text-lg leading-relaxed font-light">
              {t.processBody}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── 4. INGREDIENTS ─────────────────────────────────────────────────── */}
      <section
        data-navbar-theme="dark"
        className="bg-[#0e0b08] pt-16 pb-28 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <SectionLabel label={t.ingLabel} sub={t.ingSub} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <FadeUp className="order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
                <Image
                  src={IMG_BEANS}
                  alt="Ceremonial cacao beans"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b08]/60 via-transparent to-transparent" />
              </div>
            </FadeUp>

            {/* Text */}
            <div className="order-1 lg:order-2 space-y-8">
              {/* Main ingredients */}
              <FadeUp>
                <div className="space-y-4">
                  {t.ingItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-4 items-start p-5 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <span className="text-[#ff914d] text-xs mt-1 flex-shrink-0">✦</span>
                      <div>
                        <p className="text-[#f0ebe3] text-base font-medium">{item.main}</p>
                        <p className="text-[#8a7e72] text-sm mt-0.5">{item.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeUp>

              {/* Optional additions */}
              <FadeUp delay={0.1}>
                <p className="text-xs uppercase tracking-[0.3em] text-[#ff914d] mb-4">{t.optLabel}</p>
                <div className="space-y-3">
                  {t.optItems.map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-[#6a5e52] text-xs mt-1.5 flex-shrink-0">—</span>
                      <p className="text-[#a09488] text-sm leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </FadeUp>

              {/* Note */}
              <FadeUp delay={0.2}>
                <div
                  className="p-5 rounded-xl"
                  style={{ background: "rgba(255,145,77,0.05)", border: "1px solid rgba(255,145,77,0.12)" }}
                >
                  <p className="text-[#c9b89e] text-sm leading-relaxed font-light italic">
                    {t.ingNote}
                  </p>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHOTO BREAK ────────────────────────────────────────────────────── */}
      <div
        data-navbar-theme="dark"
        className="relative h-[38vh] min-h-[260px] overflow-hidden"
      >
        <Image
          src={IMG_PLANT}
          alt="Cacao plant"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0b08] via-transparent to-[#0e0b08]" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <span
            className="font-cormorant font-light italic text-white/80 text-center drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
            style={{ fontSize: "clamp(3rem, 8vw, 7rem)", lineHeight: 1 }}
          >
            &ldquo;{t.heroQuote}&rdquo;
          </span>
        </div>
      </div>

      {/* ── 3. PREPARATION ─────────────────────────────────────────────────── */}
      <section
        data-navbar-theme="dark"
        className="relative bg-[#110f0d] py-28 px-6 overflow-hidden"
      >
        {/* Parallax watermark */}
        <div
          className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden pr-8"
          aria-hidden
        >
          <span
            className="font-cormorant font-light italic text-white/[0.03]"
            style={{ fontSize: "clamp(10rem, 22vw, 18rem)", lineHeight: 1 }}
          >
            02
          </span>
        </div>

        <div className="max-w-6xl mx-auto">
          <SectionLabel label={t.prepLabel} sub={t.prepSub} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Steps */}
            <div className="space-y-5">
              {t.prepSteps.map((step, i) => (
                <FadeUp key={i} delay={i * 0.07}>
                  <div className="flex gap-5 items-start">
                    <span
                      className="font-cormorant font-light italic text-[#ff914d]/60 flex-shrink-0 leading-none mt-0.5"
                      style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div
                      className="flex-1 p-5 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <p className="text-[#c4b8aa] text-sm leading-relaxed">{step}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>

            {/* Image */}
            <FadeUp delay={0.2} className="hidden lg:block">
              <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: "3/4" }}>
                <Image
                  src={IMG_CUP}
                  alt="Ceremonial cacao cup"
                  fill
                  sizes="50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#110f0d]/70 via-transparent to-transparent" />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── 4. MAKE IT SACRED ─────────────────────────────────────────────── */}
      <section
        data-navbar-theme="dark"
        className="relative bg-[#0e0b08] border-y border-white/[0.05] py-28 px-6 overflow-hidden"
      >
        {/* Watermark */}
        <div
          className="absolute inset-0 flex items-center justify-start pointer-events-none select-none overflow-hidden pl-8"
          aria-hidden
        >
          <span
            className="font-cormorant font-light italic text-white/[0.03]"
            style={{ fontSize: "clamp(10rem, 22vw, 18rem)", lineHeight: 1 }}
          >
            03
          </span>
        </div>

        <div className="max-w-6xl mx-auto">
          <SectionLabel label={t.sacredLabel} sub={t.sacredSub} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <FadeUp className="order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
                <Image
                  src={IMG_THANKS}
                  alt="Giving thanks — cacao ceremony"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b08]/50 via-transparent to-transparent" />
              </div>
            </FadeUp>

            {/* Text */}
            <div className="order-1 lg:order-2">
              <FadeUp>
                <p className="text-[#a09488] text-base leading-relaxed mb-8">{t.sacredIntro}</p>
              </FadeUp>
              <div className="space-y-4">
                {t.sacredPoints.map((point, i) => (
                  <FadeUp key={i} delay={i * 0.08}>
                    <div
                      className="flex gap-4 items-start p-5 rounded-xl group transition-all duration-300"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <span className="text-[#ff914d]/50 text-xs mt-1 flex-shrink-0 group-hover:text-[#ff914d] transition-colors duration-300">✦</span>
                      <p className="text-[#c4b8aa] text-sm leading-relaxed">{point}</p>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ ─────────────────────────────────────────────────────────── */}
      <section
        data-navbar-theme="dark"
        className="bg-[#110f0d] py-28 px-6"
      >
        <div className="max-w-3xl mx-auto">
          <SectionLabel label={t.faqLabel} sub={t.faqSub} />
          <FadeUp>
            <FAQ items={t.faqItems} />
          </FadeUp>
        </div>
      </section>

      {/* ── 6. CTA ─────────────────────────────────────────────────────────── */}
      <section
        data-navbar-theme="dark"
        className="relative bg-[#0e0b08] border-t border-white/[0.06] py-28 px-6 text-center overflow-hidden"
      >
        {/* Ambient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,145,77,0.06) 0%, transparent 70%)", filter: "blur(40px)" }}
          animate={reduceMotion ? {} : { x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(201,184,158,0.05) 0%, transparent 70%)", filter: "blur(50px)" }}
          animate={reduceMotion ? {} : { x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative max-w-2xl mx-auto">
          <FadeUp>
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
              <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">{t.ctaLabel}</span>
              <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
            </div>
            <h2
              className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-10"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)" }}
            >
              {t.ctaSub}
            </h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/events"
                className="px-9 py-4 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide hover:scale-[1.04] hover:bg-[#ff914d]/90 transition-all duration-200 shadow-[0_2px_20px_rgba(255,145,77,0.3)]"
              >
                {t.ctaJoin}
              </Link>
              <Link
                href="/cacao-prep/private-booking"
                className="px-9 py-4 border border-white/25 text-[#f0ebe3] rounded-full text-sm tracking-wide hover:bg-white/10 hover:border-white/40 transition-all duration-200"
              >
                {t.ctaPrivate}
              </Link>
              <Link
                href="/shop/cacao"
                className="px-9 py-4 border border-[#ff914d]/25 text-[#ff914d] rounded-full text-sm tracking-wide hover:bg-[#ff914d]/10 hover:border-[#ff914d]/50 transition-all duration-200"
              >
                {t.ctaOrder}
              </Link>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="w-12 h-px bg-[#ff914d]/30 mx-auto mb-10" />
            <p
              className="font-cormorant font-light italic text-[#c9b89e] leading-relaxed"
              style={{ fontSize: "clamp(1.15rem, 2vw, 1.5rem)" }}
            >
              &ldquo;{t.ctaQuote}&rdquo;
            </p>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
