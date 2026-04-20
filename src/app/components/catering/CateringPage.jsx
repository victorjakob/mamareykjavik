"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Leaf,
  Mail,
  MapPin,
  Sparkles,
  Truck,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

// ── Images (local — Cloudinary folder mama-reykjavik/* returns 404 for these) ─
const IMG_DAHL = "/mamaimg/mamadahl.jpg";
const IMG_VIBE = "/mamaimg/mamavibe1.jpg";

// ── Animation helpers ────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Localized copy ───────────────────────────────────────────────────────────
// All user-facing strings live here. The component reads `language` from
// `useLanguage()` (server-hydrated via `x-locale`) and picks the right dict.
const COPY = {
  en: {
    hero: {
      eyebrow: "Mama Catering",
      headingA: "Conscious food,",
      headingB: "wherever you are.",
      lead:
        "We bring the warmth of Mama's kitchen to your team, event, or retreat. 100% plant-based, globally inspired, and made with intention.",
      primaryCta: "Get a quote",
      secondaryCta: "See what we offer",
      quoteHref: "/catering/quote",
    },
    intro: {
      a: "Every meal we make carries the same soul as our restaurant —",
      b: "rooted in community, fired with flavour.",
    },
    introTags: [
      { key: "plant", label: "100% plant-based" },
      { key: "delivery", label: "Reykjavík delivery" },
      { key: "min", label: "10+ portions" },
      { key: "custom", label: "Custom menus" },
    ],
    services: {
      eyebrow: "What we offer",
      heading: "Three ways to bring Mama to you",
    },
    serviceTiers: [
      {
        num: "01",
        label: "Corporate Lunch",
        title: "Daily Lunch Delivery",
        body:
          "Nourish your team with fresh, plant-based lunches delivered straight to your office. We bring world-inspired flavour — stews, curries, dahl, naan — without the midday chaos. Perfect for teams of 10 or more looking to eat consciously without compromising on taste.",
        details: ["Minimum 10 portions", "1 week advance notice", "Reykjavík delivery", "Weekly or one-off orders"],
        cta: "Request a quote",
        learnMoreLabel: "Learn more →",
        href: "/catering/quote",
        learnMore: "/catering/corporate-lunch",
      },
      {
        num: "02",
        label: "Event Catering",
        title: "Private & Event Catering",
        body:
          "From intimate dinner parties to company celebrations, we arrive with the warmth and soul of Mama's kitchen. Our team handles setup and service so you can stay present with your guests. Fully plant-based menus tailored to the occasion.",
        details: ["Custom menus available", "Full setup & service", "Corporate & private events", "Flexible portion sizes"],
        cta: "Tell us about your event",
      },
      {
        num: "03",
        label: "Wellness Retreats",
        title: "Retreats & Ceremonies",
        body:
          "Fuel transformative experiences with food that honours the body and soul. We partner with yoga retreats, cacao ceremonies, and wellness workshops across Iceland to provide grounding, nourishing meals that complement the journey — from morning smoothie bowls to ceremonial cacao.",
        details: ["Retreat & workshop packages", "Ceremonial cacao catering", "Dietary-specific menus", "Icelandic locations"],
        cta: "Partner with us",
      },
    ],
    steps: {
      eyebrow: "Simple process",
      heading: "How it works",
      items: [
        { n: "1", title: "Reach out", body: "Drop us a message with your date, group size, and any dietary needs. We reply within 24 hours." },
        { n: "2", title: "We craft a menu", body: "We put together a tailored proposal with menu options, pricing, and logistics — built around your event." },
        { n: "3", title: "We deliver joy", body: "Sit back. Our team brings fresh, conscious food straight to you, with the same warmth you'd find at Mama." },
      ],
    },
    menu: {
      imgEyebrow: "Made fresh daily",
      eyebrow: "Sample menu",
      heading: "What's on the table",
      lead:
        "Our catering menu draws from our full restaurant selection. Every dish is made from scratch with whole ingredients. We adapt to dietary requirements and seasonal availability.",
      items: [
        { name: "West African Peanut Stew", tags: ["GF", "crowd favourite"] },
        { name: "Dahl à la Mama", tags: ["GF", "high protein"] },
        { name: "Chili Sin Carne", tags: ["GF", "hearty"] },
        { name: "Garlic Naan", tags: ["vegan"] },
        { name: "Hummus & Sourdough", tags: ["crowd pleaser"] },
        { name: "Ceremonial Cacao", tags: ["ritual", "ceremony"] },
        { name: "Seasonal Curry", tags: ["GF", "adaptable"] },
      ],
      note:
        "Full menu on request. We accommodate all dietary needs including gluten-free, nut-free, and raw options.",
    },
    quote: {
      text:
        "Food is the most primal form of community. When we share a meal, we share ourselves.",
      author: "Mama Reykjavík",
    },
    details: {
      eyebrow: "Good to know",
      heading: "The details",
      cards: [
        { key: "min", label: "Minimum order", value: "10 portions" },
        { key: "notice", label: "Advance notice", value: "1 week minimum" },
        { key: "area", label: "Delivery area", value: "Reykjavík & surrounds" },
        { key: "food", label: "All dishes", value: "100% plant-based" },
      ],
    },
    cta: {
      eyebrow: "Let's make it happen",
      headingA: "Ready to bring",
      headingB: "Mama to your table?",
      lead:
        "Tell us about your event — dates, group size, and anything we should know. We'll come back to you within 24 hours with a tailored proposal.",
      primary: "Get a quote",
      primaryHref: "/catering/quote",
      secondary: "Visit our restaurant",
      secondaryHref: "/restaurant",
    },
  },
  is: {
    hero: {
      eyebrow: "Mama Veislumatur",
      headingA: "Meðvitaður matur,",
      headingB: "hvar sem þú ert.",
      lead:
        "Við komum með hlýju Mama eldhússins til þíns teymis, viðburðar eða retreat. 100% plöntubundið, heimsleitandi og gert af einlægni.",
      primaryCta: "Fá tilboð",
      secondaryCta: "Sjá hvað við bjóðum",
      quoteHref: "/is/catering/quote",
    },
    intro: {
      a: "Sérhver máltíð sem við gerum ber sömu sál og veitingastaðurinn —",
      b: "rótgróin í samfélaginu, eldbökuð af bragði.",
    },
    introTags: [
      { key: "plant", label: "100% plöntubundið" },
      { key: "delivery", label: "Heimsendingar í Reykjavík" },
      { key: "min", label: "10+ skammtar" },
      { key: "custom", label: "Sérsniðnir matseðlar" },
    ],
    services: {
      eyebrow: "Hvað við bjóðum",
      heading: "Þrjár leiðir til að fá Mama til þín",
    },
    serviceTiers: [
      {
        num: "01",
        label: "Hádegismatur fyrir fyrirtæki",
        title: "Daglegar hádegissendingar",
        body:
          "Nærðu teymið þitt með ferskum, plöntubundnum hádegismat sem berst beint á skrifstofuna. Við færum heimsleitandi bragð — pottrétti, karrý, dahl, naan — án hádegisruglsins. Fullkomið fyrir teymi með 10 manns eða fleiri sem vilja borða meðvitað án þess að tapa af bragði.",
        details: ["Lágmark 10 skammtar", "1 viku fyrirvari", "Heimsending í Reykjavík", "Vikulegt eða einu sinni"],
        cta: "Biðja um tilboð",
        learnMoreLabel: "Lesa meira →",
        href: "/is/catering/quote",
        learnMore: "/is/catering/corporate-lunch",
      },
      {
        num: "02",
        label: "Veislumatur",
        title: "Einka- og viðburðarmatur",
        body:
          "Frá nánum kvöldverði til fyrirtækjafagnaðar — við mætum með hlýju og sál Mama eldhússins. Teymið okkar sér um uppsetningu og þjónustu svo þú getir verið til staðar fyrir gesti þína. Algjörlega plöntubundnir matseðlar sniðnir að tilefninu.",
        details: ["Sérsniðnir matseðlar", "Full uppsetning og þjónusta", "Fyrirtækja- og einkaviðburðir", "Sveigjanlegar skammtastærðir"],
        cta: "Segðu okkur frá viðburðinum",
      },
      {
        num: "03",
        label: "Retreat og athafnir",
        title: "Retreat og athafnir",
        body:
          "Knúðu breytandi upplifanir með mat sem virðir líkama og sál. Við erum í samstarfi við jóga retreat, kakóathafnir og wellness vinnustofur um allt Ísland til að útvega grundandi og næringarríkar máltíðir sem styðja ferðalagið — allt frá morgunsmoothie bowls til ceremonial kakós.",
        details: ["Retreat og vinnustofupakkar", "Ceremonial kakóþjónusta", "Sérsniðnir matseðlar", "Íslenskir staðir"],
        cta: "Samstarf við okkur",
      },
    ],
    steps: {
      eyebrow: "Einfalt ferli",
      heading: "Svona virkar þetta",
      items: [
        { n: "1", title: "Hafðu samband", body: "Sendu okkur skilaboð með dagsetningu, hópastærð og sérstökum kröfum. Við svörum innan 24 klst." },
        { n: "2", title: "Við semjum matseðil", body: "Við setjum saman sérsniðna tillögu með matseðli, verði og skipulagi — byggt utan um þinn viðburð." },
        { n: "3", title: "Við sendum gleðina", body: "Slakaðu á. Teymið okkar mætir með ferskan, meðvitaðan mat, með sömu hlýju og þú finnur á Mama." },
      ],
    },
    menu: {
      imgEyebrow: "Gert ferskt daglega",
      eyebrow: "Dæmi um matseðil",
      heading: "Það sem við eldum",
      lead:
        "Veisluseðill okkar byggir á öllu úrvali veitingastaðarins. Sérhver réttur er eldaður frá grunni úr heilum hráefnum. Við aðlögum okkur að sérþörfum og árstíðum.",
      items: [
        { name: "Vestur-afrískur hnetu-pottréttur", tags: ["GF", "vinsæll"] },
        { name: "Dahl à la Mama", tags: ["GF", "próteinríkur"] },
        { name: "Chili Sin Carne", tags: ["GF", "saðsamur"] },
        { name: "Hvítlauks-naan", tags: ["vegan"] },
        { name: "Hummus og súrdeig", tags: ["allir elska"] },
        { name: "Ceremonial kakó", tags: ["helgiathöfn", "ceremony"] },
        { name: "Árstíða-karrý", tags: ["GF", "sveigjanlegt"] },
      ],
      note:
        "Fullur matseðill að beiðni. Við mætum öllum sérþörfum: glútenlaust, hnetulaust, hrátt.",
    },
    quote: {
      text:
        "Matur er frumsta form samfélags. Þegar við deilum máltíð, deilum við okkur sjálfum.",
      author: "Mama Reykjavík",
    },
    details: {
      eyebrow: "Gott að vita",
      heading: "Smáatriðin",
      cards: [
        { key: "min", label: "Lágmarks pöntun", value: "10 skammtar" },
        { key: "notice", label: "Fyrirvari", value: "1 vika að lágmarki" },
        { key: "area", label: "Sendingarsvæði", value: "Reykjavík og nágrenni" },
        { key: "food", label: "Allir réttir", value: "100% plöntubundnir" },
      ],
    },
    cta: {
      eyebrow: "Látum þetta gerast",
      headingA: "Tilbúin(n) að fá",
      headingB: "Mama á þitt borð?",
      lead:
        "Segðu okkur frá viðburðinum — dagsetning, hópastærð og allt sem við ættum að vita. Við höfum samband innan 24 klst. með sérsniðinni tillögu.",
      primary: "Fá tilboð",
      primaryHref: "/is/catering/quote",
      secondary: "Heimsækja veitingastaðinn",
      secondaryHref: "/is/restaurant",
    },
  },
};

const tierIcons = [Truck, UtensilsCrossed, Sparkles];
const tierAccents = ["#ff914d", "#a3c96c", "#c9a86c"];
const introIcons = { plant: Leaf, delivery: Truck, min: Users, custom: ClipboardList };
const detailIcons = { min: Users, notice: CalendarClock, area: MapPin, food: Leaf };

// ── Component ────────────────────────────────────────────────────────────────
export default function CateringPage() {
  const { language } = useLanguage();
  const t = COPY[language === "is" ? "is" : "en"];

  return (
    <main className="bg-[#110f0d] text-[#f0ebe3] overflow-x-hidden">

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section
        data-navbar-theme="light"
        className="relative flex min-h-screen items-end overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src={IMG_DAHL}
            alt="Mama catering food"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#110f0d] via-[#110f0d]/50 to-[#110f0d]/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#110f0d]/60 to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 w-full px-6 pb-20 pt-40 sm:px-10 lg:px-20">
          <div className="max-w-2xl">
            <FadeUp delay={0.1}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#ff914d]">
                {t.hero.eyebrow}
              </p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <h1
                className="font-cormorant font-light italic leading-tight"
                style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
              >
                {t.hero.headingA}
                <br />
                <span className="text-[#ff914d]">{t.hero.headingB}</span>
              </h1>
            </FadeUp>
            <FadeUp delay={0.35}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#a09488]">
                {t.hero.lead}
              </p>
            </FadeUp>
            <FadeUp delay={0.45}>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href={t.hero.quoteHref}
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff914d] px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-[#ff914d]/90 active:scale-95"
                >
                  {t.hero.primaryCta}
                  <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                </Link>
                <a
                  href="#services"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-medium text-[#f0ebe3] transition hover:bg-white/[0.06]"
                >
                  {t.hero.secondaryCta}
                </a>
              </div>
            </FadeUp>
          </div>
        </div>

        <Sparkles
          className="pointer-events-none absolute right-4 bottom-8 h-[min(55vw,14rem)] w-[min(55vw,14rem)] text-white/[0.045] sm:right-8 sm:bottom-16 sm:h-[18rem] sm:w-[18rem]"
          strokeWidth={0.9}
          aria-hidden
        />
      </section>

      {/* ── 2. INTRO STRIP ──────────────────────────────────────────────── */}
      <section data-navbar-theme="dark" className="bg-[#160f0a] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-10">
          <FadeUp>
            <p className="text-2xl font-light leading-relaxed text-[#a09488] sm:text-3xl">
              {t.intro.a}
              <br className="hidden sm:block" />{" "}
              <span className="text-[#f0ebe3] font-medium">
                {t.intro.b}
              </span>
            </p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-[#8a7e72]">
              {t.introTags.map(({ key, label }) => {
                const Icon = introIcons[key];
                return (
                  <span key={key} className="inline-flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff914d]/10 text-[#ff914d]">
                      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    {label}
                  </span>
                );
              })}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 3. SERVICE TIERS ────────────────────────────────────────────── */}
      <section id="services" data-navbar-theme="dark" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <FadeUp>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#ff914d]">
              {t.services.eyebrow}
            </p>
            <h2 className="font-cormorant font-light italic" style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)" }}>{t.services.heading}</h2>
          </FadeUp>

          <div className="mt-16 space-y-6">
            {t.serviceTiers.map((s, i) => {
              const ServiceIcon = tierIcons[i];
              const accent = tierAccents[i];
              return (
              <FadeUp key={s.num} delay={i * 0.1}>
                <article className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 transition hover:bg-white/[0.055] sm:p-10">
                  {/* Giant faint number */}
                  <span
                    className="pointer-events-none absolute right-6 top-4 select-none text-8xl font-black text-white/[0.04] sm:text-[9rem]"
                    aria-hidden
                  >
                    {s.num}
                  </span>

                  <div className="relative z-10 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
                    <div>
                      <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: accent }}>
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/[0.08]"
                          style={{ color: accent }}
                        >
                          <ServiceIcon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                        </span>
                        {s.label}
                      </p>
                      <h3 className="font-cormorant font-light italic" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}>{s.title}</h3>
                      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#a09488]">{s.body}</p>

                      <ul className="mt-5 flex flex-wrap gap-2">
                        {s.details.map((d) => (
                          <li
                            key={d}
                            className="rounded-full border border-white/[0.10] px-3.5 py-1 text-xs text-[#a09488]"
                          >
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col gap-2 self-end sm:self-start shrink-0">
                      {s.href ? (
                        <Link
                          href={s.href}
                          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition hover:opacity-80"
                          style={{ background: accent + "22", color: accent, border: `1px solid ${accent}44` }}
                        >
                          {s.cta}
                          <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                        </Link>
                      ) : (
                        <a
                          href={`mailto:mama.reykjavik@gmail.com?subject=${encodeURIComponent(s.title + " – Catering Enquiry")}`}
                          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition hover:opacity-80"
                          style={{ background: accent + "22", color: accent, border: `1px solid ${accent}44` }}
                        >
                          {s.cta}
                          <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                        </a>
                      )}
                      {s.learnMore && (
                        <Link
                          href={s.learnMore}
                          className="inline-flex items-center gap-1.5 rounded-full px-6 py-2.5 text-xs font-medium text-[#8a7e72] border border-white/[0.08] transition hover:text-[#f0ebe3] hover:border-white/20"
                        >
                          {s.learnMoreLabel || "Learn more →"}
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              </FadeUp>
            );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ─────────────────────────────────────────────── */}
      <section data-navbar-theme="dark" className="bg-[#160f0a] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <FadeUp>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#ff914d]">
              {t.steps.eyebrow}
            </p>
            <h2 className="font-cormorant font-light italic" style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)" }}>{t.steps.heading}</h2>
          </FadeUp>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {t.steps.items.map((step, i) => (
              <FadeUp key={step.n} delay={i * 0.12}>
                <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8">
                  {/* Step number */}
                  <span className="block text-5xl font-black text-[#ff914d]/20 leading-none mb-4">{step.n}</span>
                  <h3 className="text-lg font-bold text-[#f0ebe3]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#8a7e72]">{step.body}</p>

                  {/* Connector line */}
                  {i < t.steps.items.length - 1 && (
                    <ChevronRight
                      className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-white/15 sm:block"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  )}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. MENU PREVIEW ─────────────────────────────────────────────── */}
      <section data-navbar-theme="light" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            {/* Left — image */}
            <FadeUp>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <Image
                  src={IMG_VIBE}
                  alt="Mama kitchen"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#110f0d]/60 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff914d]">{t.menu.imgEyebrow}</p>
                </div>
              </div>
            </FadeUp>

            {/* Right — menu list */}
            <div>
              <FadeUp>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#ff914d]">
                  {t.menu.eyebrow}
                </p>
                <h2 className="font-cormorant font-light italic" style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)" }}>
                  {t.menu.heading}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-[#8a7e72]">
                  {t.menu.lead}
                </p>
              </FadeUp>

              <div className="mt-8 space-y-3">
                {t.menu.items.map((item, i) => (
                  <FadeUp key={item.name} delay={i * 0.05}>
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <span className="text-[15px] font-medium text-[#f0ebe3]">{item.name}</span>
                      <div className="flex gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-[#8a7e72]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>

              <FadeUp delay={0.3}>
                <p className="mt-5 text-xs text-[#8a7e72]">
                  {t.menu.note}
                </p>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. PHOTO BREAK ──────────────────────────────────────────────── */}
      <section
        data-navbar-theme="light"
        className="relative h-[50vh] overflow-hidden sm:h-[60vh]"
      >
        <Image
          src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1762326608/dahl_aumxpm.jpg"
          alt="Mama atmosphere"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#110f0d]/55" />
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <FadeUp>
            <blockquote className="max-w-2xl">
              <p className="text-2xl font-light italic leading-relaxed text-[#f0ebe3] sm:text-3xl">
                &ldquo;{t.quote.text}&rdquo;
              </p>
              <cite className="mt-4 block text-xs font-semibold uppercase tracking-[0.2em] text-[#ff914d] not-italic">
                {t.quote.author}
              </cite>
            </blockquote>
          </FadeUp>
        </div>
      </section>

      {/* ── 7. PRACTICAL DETAILS ────────────────────────────────────────── */}
      <section data-navbar-theme="dark" className="bg-[#160f0a] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <FadeUp>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#ff914d]">
              {t.details.eyebrow}
            </p>
            <h2 className="font-cormorant font-light italic" style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)" }}>{t.details.heading}</h2>
          </FadeUp>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.details.cards.map((item, i) => {
              const CardIcon = detailIcons[item.key];
              return (
              <FadeUp key={item.key} delay={i * 0.08}>
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 text-center">
                  <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff914d]/10 text-[#ff914d]">
                    <CardIcon className="h-6 w-6" strokeWidth={1.65} aria-hidden />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7e72]">{item.label}</p>
                  <p className="mt-2 text-lg font-bold text-[#f0ebe3]">{item.value}</p>
                </div>
              </FadeUp>
            );
            })}
          </div>
        </div>
      </section>

      {/* ── 8. CTA ──────────────────────────────────────────────────────── */}
      <section
        data-navbar-theme="dark"
        className="relative overflow-hidden py-24 sm:py-32"
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#ff914d]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#ff914d]/8 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 text-center sm:px-10">
          <FadeUp>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#ff914d]">
              {t.cta.eyebrow}
            </p>
            <h2 className="font-cormorant font-light italic leading-tight" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)" }}>
              {t.cta.headingA}<br />
              <span className="text-[#ff914d]">{t.cta.headingB}</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[#8a7e72]">
              {t.cta.lead}
            </p>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href={t.cta.primaryHref}
                className="inline-flex items-center gap-3 rounded-full bg-[#ff914d] px-9 py-4 text-base font-semibold text-black transition hover:bg-[#ff914d]/90 active:scale-95"
              >
                {t.cta.primary}
                <ArrowRight className="h-5 w-5" strokeWidth={2.25} aria-hidden />
              </Link>
              <a
                href={t.cta.secondaryHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-4 text-sm font-medium text-[#f0ebe3] transition hover:bg-white/[0.06]"
              >
                {t.cta.secondary}
              </a>
            </div>
            <p className="mt-5 text-xs text-[#8a7e72]">mama.reykjavik@gmail.com · Bankastræti 2, 101 Reykjavík</p>
          </FadeUp>
        </div>
      </section>

    </main>
  );
}
