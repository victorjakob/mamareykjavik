"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  ChevronRight,
  Globe,
  Leaf,
  MapPin,
  Repeat,
  Timer,
  Truck,
  Users,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

// ── Animation helper ──────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── COPY (en / is) ────────────────────────────────────────────────────────────
const COPY = {
  en: {
    hero: {
      eyebrow: "Corporate Lunch · Reykjavík Delivery",
      headingA: "Nourishing lunches,",
      headingB: "delivered to your team.",
      lead: "Fresh, 100% plant-based meals delivered straight to your Reykjavík office. World-inspired flavour — stews, curries, dahl, naan — made from scratch, every time.",
      ctaPrimary: "Request a quote",
      ctaSecondary: "How it works",
      imageAlt: "Plant-based corporate lunch by Mama Reykjavík",
    },
    heroQuickFacts: [
      "10+ portions",
      "1 week notice",
      "Weekly or one-off",
      "Reykjavík delivery",
    ],
    intro: {
      leadA: "The midday meal sets the tone for the afternoon.",
      leadB: "We make sure it's one worth looking forward to.",
    },
    why: {
      eyebrow: "Why teams choose us",
      heading: "Conscious food that fits your working day",
      items: [
        {
          title: "100% plant-based",
          body: "Every dish is built from whole ingredients — no fillers, no shortcuts. Energising food that keeps your team focused through the afternoon.",
        },
        {
          title: "Delivered to your door",
          body: "We handle everything from kitchen to office. Hot, ready, and on time — no coordination stress for you.",
        },
        {
          title: "Weekly or one-off",
          body: "Set up a recurring weekly lunch for your team, or order a one-time delivery for a company event. Fully flexible.",
        },
        {
          title: "World-inspired menu",
          body: "West African stews, Authentic Indian spiced dahls, smoky chilis. Rotating dishes that give your team something to look forward to each week.",
        },
      ],
    },
    photoBreak: {
      quote:
        "\u201cEvery dish we deliver carries the same intention as our restaurant — made with care, for people who deserve to eat well.\u201d",
      caption: "Mama Reykjavík",
      imageAlt: "Mama Reykjavík kitchen atmosphere",
    },
    steps: {
      eyebrow: "Simple process",
      heading: "Up and running in three steps",
      items: [
        {
          n: "01",
          title: "Tell us your setup",
          body: "Share your team size, preferred delivery day, and any dietary requirements. Takes two minutes.",
        },
        {
          n: "02",
          title: "We craft your proposal",
          body: "We put together a menu and pricing within 24 hours — no obligation, no hidden costs.",
        },
        {
          n: "03",
          title: "We show up every week",
          body: "Sit back. Fresh, nourishing food arrives at your office on schedule. Your team eats well, you take the credit.",
        },
      ],
      cta: "Start with a quote",
    },
    menu: {
      eyebrow: "Sample menu",
      heading: "What's on the table",
      lead: "Our catering menu draws from the full Mama kitchen. Every dish is made from scratch with whole ingredients, naturally gluten-free where noted. We rotate seasonally and adapt to any dietary requirements — just let us know.",
      note: "Full menu available on request. We accommodate gluten-free, nut-free, and other dietary requirements — mention it in your quote request.",
      imageEyebrow: "Made fresh daily",
      imageCaption: "All dishes prepared in our Bankastræti kitchen",
      imageAlt: "Mama Reykjavík food",
      dishes: [
        {
          name: "West African Peanut Stew",
          tags: ["GF", "crowd favourite"],
          desc: "Rich, creamy, warmly spiced. Built for groups.",
        },
        {
          name: "Dahl à la Mama",
          tags: ["GF", "high protein"],
          desc: "Slow-cooked red lentils, cumin, turmeric, coconut.",
        },
        {
          name: "Chili Sin Carne",
          tags: ["GF", "hearty"],
          desc: "Deep, smoky, fiercely satisfying. A team staple.",
        },
        {
          name: "Seasonal Curry",
          tags: ["GF", "adaptable"],
          desc: "Rotates with what's fresh and locally available.",
        },
        {
          name: "Garlic Naan",
          tags: ["side"],
          desc: "Freshly made. Perfect for scooping every last drop.",
        },
        {
          name: "Hummus & Sourdough",
          tags: ["crowd pleaser"],
          desc: "Smooth, generously portioned. Always a hit.",
        },
      ],
    },
    details: {
      eyebrow: "Good to know",
      heading: "The practical details",
      items: [
        { label: "Minimum order", value: "10 portions" },
        { label: "Notice needed", value: "1 week minimum" },
        { label: "Delivery area", value: "Greater Reykjavík" },
        { label: "Frequency", value: "Weekly or one-off" },
        { label: "All dishes", value: "100% plant-based" },
        { label: "Response time", value: "Within 24 hours" },
      ],
    },
    faq: {
      eyebrow: "Questions",
      heading: "Frequently asked",
      items: [
        {
          q: "Do you deliver outside central Reykjavík?",
          a: "We deliver across Greater Reykjavík including Kópavogur, Garðabær, and Hafnarfjörður. Mention your address in the quote request and we'll confirm availability.",
        },
        {
          q: "Can we order for fewer than 10 people?",
          a: "Our minimum is 10 portions per order. This keeps preparation efficient and ensures the food arrives fresh and hot. If your team is smaller, we'd love to see you at the restaurant.",
        },
        {
          q: "What if we have allergies or dietary restrictions?",
          a: "All our food is 100% plant-based. We can accommodate gluten-free, nut-free, and other requirements — just mention them when you request your quote and we'll build the menu around your team.",
        },
        {
          q: "How does a recurring weekly order work?",
          a: "We agree on a delivery day, portion count, and menu rotation. You're billed weekly and can adjust quantities or pause at any time with one week's notice.",
        },
        {
          q: "How quickly can we get our first delivery?",
          a: "We ask for at least one week's notice for the first order. Once you're set up, ongoing weekly deliveries run smoothly from there.",
        },
      ],
    },
    cta: {
      eyebrow: "Let's make it happen",
      headingA: "Ready to feed",
      headingB: "your team well?",
      body: "Tell us your team size, preferred day, and any dietary needs. We'll have a tailored proposal back to you within 24 hours.",
      primary: "Request a quote",
      secondary: "All catering options",
      footer:
        "team@mama.is · (+354) 616-7722 · Bankastræti 2, 101 Reykjavík",
    },
    quoteHref: "/catering/quote",
    cateringHref: "/catering",
  },
  is: {
    hero: {
      eyebrow: "Hádegismatur fyrir fyrirtæki · Reykjavík heimsending",
      headingA: "Næringarríkur hádegismatur,",
      headingB: "sendur á skrifstofu þína.",
      lead: "Ferskir, 100% plöntubundnir réttir sendir beint á skrifstofu þína í Reykjavík. Heimsinnblásið bragð — súpur, karí, dahl, naan — allt gert frá grunni, í hvert sinn.",
      ctaPrimary: "Biddu um tilboð",
      ctaSecondary: "Hvernig það virkar",
      imageAlt: "Plöntubundinn hádegismatur fyrir fyrirtæki frá Mama Reykjavík",
    },
    heroQuickFacts: [
      "10+ skammtar",
      "1 viku fyrirvari",
      "Vikulega eða einu sinni",
      "Heimsending í Reykjavík",
    ],
    intro: {
      leadA: "Hádegismaturinn gefur eftirmiðdeginum tóninn.",
      leadB: "Við sjáum til þess að hann sé þess virði að hlakka til.",
    },
    why: {
      eyebrow: "Af hverju teymi velja okkur",
      heading: "Meðvitaður matur sem passar vinnudaginn",
      items: [
        {
          title: "100% plöntubundið",
          body: "Hver réttur er gerður úr heilum hráefnum — engin fylliefni, engar styttingar. Orkuríkur matur sem heldur teyminu einbeittu út daginn.",
        },
        {
          title: "Sent heim að dyrum",
          body: "Við sjáum um allt frá eldhúsi til skrifstofu. Heitt, tilbúið og á réttum tíma — engin samhæfingarstreita fyrir þig.",
        },
        {
          title: "Vikulega eða einu sinni",
          body: "Settu upp fasta vikulega hádegissendingu fyrir teymið, eða pantaðu einstaka sendingu fyrir fyrirtækjaviðburð. Alveg sveigjanlegt.",
        },
        {
          title: "Heimsinnblásinn matseðill",
          body: "Vestur-afrískar súpur, ekta indverskar dahl með kryddum, reyktur chili. Réttir sem skiptast á og gefa teyminu eitthvað til að hlakka til í hverri viku.",
        },
      ],
    },
    photoBreak: {
      quote:
        "\u201cHver réttur sem við sendum ber sömu ásetning og veitingahúsið okkar — gerður af umhyggju, fyrir fólk sem á skilið að borða vel.\u201d",
      caption: "Mama Reykjavík",
      imageAlt: "Eldhússtemning hjá Mama Reykjavík",
    },
    steps: {
      eyebrow: "Einfalt ferli",
      heading: "Komið í gang í þremur skrefum",
      items: [
        {
          n: "01",
          title: "Segðu okkur frá ykkur",
          body: "Deildu stærð teymisins, kjörnum sendingardegi og öllum mataræðisþörfum. Tekur tvær mínútur.",
        },
        {
          n: "02",
          title: "Við útbúum tilboð",
          body: "Við setjum saman matseðil og verðlagningu innan 24 klukkustunda — án skuldbindinga, engin falin gjöld.",
        },
        {
          n: "03",
          title: "Við mætum í hverri viku",
          body: "Slakaðu á. Ferskur, næringarríkur matur kemur á skrifstofuna á áætluðum tíma. Teymið borðar vel, þú færð heiðurinn.",
        },
      ],
      cta: "Byrjaðu með tilboði",
    },
    menu: {
      eyebrow: "Sýnishorn af matseðli",
      heading: "Það sem er á borðinu",
      lead: "Veislumatseðillinn okkar er dreginn úr öllu Mama-eldhúsinu. Hver réttur er gerður frá grunni úr heilum hráefnum, náttúrulega glútenlaus þar sem tekið er fram. Við skiptum eftir árstíðum og aðlögum að hvers kyns mataræðisþörfum — segðu okkur bara frá.",
      note: "Fullan matseðil má fá að beiðni. Við komum til móts við glúten-, hnetu- og aðrar mataræðisþarfir — nefndu það í tilboðsbeiðninni þinni.",
      imageEyebrow: "Útbúið ferskt daglega",
      imageCaption: "Allir réttir gerðir í eldhúsinu okkar á Bankastræti",
      imageAlt: "Matur frá Mama Reykjavík",
      dishes: [
        {
          name: "Vestur-afrísk jarðhnetusúpa",
          tags: ["GF", "vinsælast"],
          desc: "Rík, rjómakennd, hlýlega krydduð. Gerð fyrir hópa.",
        },
        {
          name: "Dahl à la Mama",
          tags: ["GF", "próteinrík"],
          desc: "Hæggeldaðar rauðar linsur, kúmen, túrmerik, kókos.",
        },
        {
          name: "Chili Sin Carne",
          tags: ["GF", "saðsamt"],
          desc: "Djúpt, reykt, mjög saðsamt. Uppáhald hjá teyminu.",
        },
        {
          name: "Árstíðabundið karí",
          tags: ["GF", "aðlögunarhæft"],
          desc: "Skiptist eftir því sem er ferskt og fáanlegt hverju sinni.",
        },
        {
          name: "Hvítlauksnaan",
          tags: ["meðlæti"],
          desc: "Nýbakað. Fullkomið til að draga upp hvern einasta dropa.",
        },
        {
          name: "Hummus & súrdeigsbrauð",
          tags: ["vinsælt"],
          desc: "Mjúkt, rausnarlegir skammtar. Alltaf vinsælt.",
        },
      ],
    },
    details: {
      eyebrow: "Gott að vita",
      heading: "Hagnýtu atriðin",
      items: [
        { label: "Lágmarkspöntun", value: "10 skammtar" },
        { label: "Fyrirvari", value: "Að lágmarki 1 vika" },
        { label: "Sendingarsvæði", value: "Stór-Reykjavíkursvæðið" },
        { label: "Tíðni", value: "Vikulega eða einu sinni" },
        { label: "Allir réttir", value: "100% plöntubundnir" },
        { label: "Svartími", value: "Innan 24 klst." },
      ],
    },
    faq: {
      eyebrow: "Spurningar",
      heading: "Algengar spurningar",
      items: [
        {
          q: "Sendið þið utan miðborgar Reykjavíkur?",
          a: "Við sendum um allt Stór-Reykjavíkursvæðið, þar á meðal Kópavog, Garðabæ og Hafnarfjörð. Nefndu heimilisfangið þitt í tilboðsbeiðninni og við staðfestum framboð.",
        },
        {
          q: "Getum við pantað fyrir færri en 10 manns?",
          a: "Lágmark er 10 skammtar í pöntun. Það heldur undirbúningnum skilvirkum og tryggir að maturinn komi ferskur og heitur. Ef teymið er minna myndum við gjarnan sjá ykkur á veitingahúsinu.",
        },
        {
          q: "Hvað ef við höfum ofnæmi eða mataræðiskröfur?",
          a: "Allur maturinn okkar er 100% plöntubundinn. Við komum til móts við glúten-, hnetu- og aðrar kröfur — nefndu þær bara þegar þú biður um tilboðið og við byggjum matseðilinn í kringum teymið þitt.",
        },
        {
          q: "Hvernig virkar föst vikuleg pöntun?",
          a: "Við komum okkur saman um sendingardag, fjölda skammta og matseðilsskipti. Þú ert rukkaður vikulega og getur breytt magni eða gert hlé með einnar viku fyrirvara.",
        },
        {
          q: "Hversu fljótt getum við fengið fyrstu sendinguna?",
          a: "Við biðjum um að lágmarki einnar viku fyrirvara fyrir fyrstu pöntun. Þegar þið eruð komin í gang ganga fastar vikulegar sendingar hnökralaust.",
        },
      ],
    },
    cta: {
      eyebrow: "Látum þetta gerast",
      headingA: "Tilbúin að næra",
      headingB: "teymið vel?",
      body: "Segðu okkur frá stærð teymisins, kjörnum degi og mataræðisþörfum. Við sendum sérsniðið tilboð innan 24 klukkustunda.",
      primary: "Biddu um tilboð",
      secondary: "Allir veislumöguleikar",
      footer:
        "team@mama.is · (+354) 616-7722 · Bankastræti 2, 101 Reykjavík",
    },
    quoteHref: "/is/catering/quote",
    cateringHref: "/is/catering",
  },
};

// ── Icons (kept outside COPY so we can reference components) ──────────────────
const heroFactIcons = [Users, CalendarClock, Repeat, Truck];
const whyIcons = [Leaf, Truck, Repeat, Globe];
const detailIcons = [Users, CalendarClock, MapPin, Repeat, Leaf, Timer];

// ── Component ─────────────────────────────────────────────────────────────────
export default function CorporateLunchPage() {
  const { language } = useLanguage();
  const t = COPY[language === "is" ? "is" : "en"];

  return (
    <main className="bg-[#110f0d] text-[#f0ebe3] overflow-x-hidden">
      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section
        data-navbar-theme="light"
        className="relative flex min-h-screen items-end overflow-hidden"
      >
        <div className="absolute inset-0">
          <Image
            src="/mamaimg/mamadahl.jpg"
            alt={t.hero.imageAlt}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b08] via-[#110f0d]/55 to-[#110f0d]/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e0b08]/70 to-transparent" />
        </div>

        <div className="relative z-10 w-full px-6 pb-20 pt-44 sm:px-10 lg:px-20">
          <div className="max-w-2xl">
            <FadeUp delay={0.08}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#ff914d]">
                {t.hero.eyebrow}
              </p>
            </FadeUp>
            <FadeUp delay={0.16}>
              <h1
                className="font-cormorant font-light italic leading-tight"
                style={{
                  fontSize: "clamp(2.8rem, 6.5vw, 5.2rem)",
                  color: "#f0ebe3",
                }}
              >
                {t.hero.headingA}
                <br />
                <span style={{ color: "#ff914d" }}>{t.hero.headingB}</span>
              </h1>
            </FadeUp>
            <FadeUp delay={0.26}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#a09488]">
                {t.hero.lead}
              </p>
            </FadeUp>
            <FadeUp delay={0.36}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={t.quoteHref}
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff914d] px-8 py-4 text-sm font-semibold text-black transition hover:bg-[#ff914d]/90 active:scale-95 shadow-[0_4px_24px_rgba(255,145,77,0.3)]"
                >
                  {t.hero.ctaPrimary}
                  <ArrowRight
                    className="h-4 w-4"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-medium text-[#f0ebe3] transition hover:bg-white/[0.06]"
                >
                  {t.hero.ctaSecondary}
                </a>
              </div>
            </FadeUp>
            <FadeUp delay={0.44}>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#6a5e52]">
                {t.heroQuickFacts.map((label, i) => {
                  const Icon = heroFactIcons[i];
                  return (
                    <span key={label} className="inline-flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff914d]/10 text-[#ff914d]">
                        <Icon
                          className="h-3.5 w-3.5"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </span>
                      {label}
                    </span>
                  );
                })}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── 2. INTRO PULL-QUOTE ──────────────────────────────────────────────── */}
      <section data-navbar-theme="dark" className="bg-[#0e0b08] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-10">
          <FadeUp>
            <p className="text-2xl font-light leading-relaxed text-[#7a6e68] sm:text-3xl">
              {t.intro.leadA}{" "}
              <span className="text-[#f0ebe3] font-normal">
                {t.intro.leadB}
              </span>
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── 3. WHY IT WORKS ──────────────────────────────────────────────────── */}
      <section data-navbar-theme="dark" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <FadeUp>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#ff914d]">
              {t.why.eyebrow}
            </p>
            <h2
              className="font-cormorant font-light italic"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)" }}
            >
              {t.why.heading}
            </h2>
          </FadeUp>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.why.items.map((item, i) => {
              const WhyIcon = whyIcons[i];
              return (
                <FadeUp key={item.title} delay={i * 0.08}>
                  <div
                    className="rounded-2xl p-7 h-full"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff914d]/10 text-[#ff914d]">
                      <WhyIcon
                        className="h-6 w-6"
                        strokeWidth={1.65}
                        aria-hidden
                      />
                    </span>
                    <h3
                      className="font-cormorant italic font-light mb-2"
                      style={{ fontSize: "1.25rem", color: "#f0ebe3" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#8a7e72]">
                      {item.body}
                    </p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. PHOTO BREAK ───────────────────────────────────────────────────── */}
      <section
        data-navbar-theme="light"
        className="relative h-[45vh] overflow-hidden sm:h-[55vh]"
      >
        <Image
          src="/mamaimg/mamavibe1.jpg"
          alt={t.photoBreak.imageAlt}
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0e0b08]/50" />
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <FadeUp>
            <p
              className="font-cormorant font-light italic text-[#f0ebe3] max-w-2xl"
              style={{
                fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
                lineHeight: 1.4,
              }}
            >
              {t.photoBreak.quote}
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-[#ff914d]">
              {t.photoBreak.caption}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── 5. HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        data-navbar-theme="dark"
        className="bg-[#0e0b08] py-20 sm:py-28"
      >
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <FadeUp>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#ff914d]">
              {t.steps.eyebrow}
            </p>
            <h2
              className="font-cormorant font-light italic"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)" }}
            >
              {t.steps.heading}
            </h2>
          </FadeUp>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {t.steps.items.map((step, i) => (
              <FadeUp key={step.n} delay={i * 0.1}>
                <div
                  className="relative rounded-2xl p-8 h-full"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span
                    className="block font-cormorant italic leading-none mb-5"
                    style={{
                      fontSize: "3.5rem",
                      color: "rgba(255,145,77,0.15)",
                    }}
                  >
                    {step.n}
                  </span>
                  <h3 className="text-base font-semibold text-[#f0ebe3] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#8a7e72]">
                    {step.body}
                  </p>
                  {i < t.steps.items.length - 1 && (
                    <ChevronRight
                      className="absolute -right-3.5 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-white/15 sm:block"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  )}
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.35}>
            <div className="mt-10 text-center">
              <Link
                href={t.quoteHref}
                className="inline-flex items-center gap-2 rounded-full bg-[#ff914d] px-9 py-4 text-sm font-semibold text-black transition hover:bg-[#ff914d]/90 active:scale-95 shadow-[0_4px_20px_rgba(255,145,77,0.25)]"
              >
                {t.steps.cta}
                <ArrowRight
                  className="h-4 w-4"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 6. SAMPLE MENU ───────────────────────────────────────────────────── */}
      <section data-navbar-theme="dark" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            {/* Left — text */}
            <div>
              <FadeUp>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#ff914d]">
                  {t.menu.eyebrow}
                </p>
                <h2
                  className="font-cormorant font-light italic mb-5"
                  style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)" }}
                >
                  {t.menu.heading}
                </h2>
                <p className="text-[#8a7e72] leading-relaxed mb-8">
                  {t.menu.lead}
                </p>
              </FadeUp>

              <div className="space-y-3">
                {t.menu.dishes.map((dish, i) => (
                  <FadeUp key={dish.name} delay={i * 0.06}>
                    <div
                      className="flex items-start justify-between gap-4 rounded-xl p-4"
                      style={{
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div>
                        <p className="text-sm font-medium text-[#f0ebe3]">
                          {dish.name}
                        </p>
                        <p className="text-xs text-[#6a5e52] mt-0.5">
                          {dish.desc}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-1.5 justify-end">
                        {dish.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/[0.08] px-2.5 py-0.5 text-[10px] text-[#8a7e72]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>

              <FadeUp delay={0.4}>
                <p className="mt-5 text-xs text-[#6a5e52]">{t.menu.note}</p>
              </FadeUp>
            </div>

            {/* Right — image */}
            <FadeUp delay={0.1} className="lg:sticky lg:top-28">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                <Image
                  src="/mamaimg/mamacoffee.jpg"
                  alt={t.menu.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b08]/70 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#ff914d] mb-1">
                    {t.menu.imageEyebrow}
                  </p>
                  <p className="text-sm text-[#a09488]">
                    {t.menu.imageCaption}
                  </p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── 7. PRACTICAL DETAILS ─────────────────────────────────────────────── */}
      <section data-navbar-theme="dark" className="bg-[#0e0b08] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <FadeUp>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#ff914d]">
              {t.details.eyebrow}
            </p>
            <h2
              className="font-cormorant font-light italic mb-12"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)" }}
            >
              {t.details.heading}
            </h2>
          </FadeUp>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.details.items.map((item, i) => {
              const DetailIcon = detailIcons[i];
              return (
                <FadeUp key={item.label} delay={i * 0.07}>
                  <div
                    className="flex items-center gap-5 rounded-2xl p-6"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ff914d]/10 text-[#ff914d]">
                      <DetailIcon
                        className="h-6 w-6"
                        strokeWidth={1.65}
                        aria-hidden
                      />
                    </span>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#6a5e52] mb-0.5">
                        {item.label}
                      </p>
                      <p className="text-base font-semibold text-[#f0ebe3]">
                        {item.value}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 8. FAQ ───────────────────────────────────────────────────────────── */}
      <section data-navbar-theme="dark" className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 sm:px-10">
          <FadeUp>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#ff914d]">
              {t.faq.eyebrow}
            </p>
            <h2
              className="font-cormorant font-light italic mb-12"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)" }}
            >
              {t.faq.heading}
            </h2>
          </FadeUp>

          {t.faq.items.map((item, i) => (
            <FadeUp key={item.q} delay={i * 0.06}>
              <div
                className="mb-4 rounded-2xl p-7"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="font-medium text-[#f0ebe3] mb-2">{item.q}</p>
                <p className="text-sm leading-relaxed text-[#8a7e72]">
                  {item.a}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── 9. CTA ───────────────────────────────────────────────────────────── */}
      <section
        data-navbar-theme="dark"
        className="relative overflow-hidden bg-[#0e0b08] py-24 sm:py-32"
      >
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#ff914d]/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#ff914d]/[0.05] blur-3xl" />

        <div className="relative mx-auto max-w-2xl px-6 text-center sm:px-10">
          <FadeUp>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-[#ff914d]">
              {t.cta.eyebrow}
            </p>
            <h2
              className="font-cormorant font-light italic leading-tight mb-6"
              style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)" }}
            >
              {t.cta.headingA}
              <br />
              <span style={{ color: "#ff914d" }}>{t.cta.headingB}</span>
            </h2>
            <p className="text-[#8a7e72] leading-relaxed mb-10 max-w-lg mx-auto">
              {t.cta.body}
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={t.quoteHref}
                className="inline-flex items-center gap-2 rounded-full bg-[#ff914d] px-10 py-4 text-base font-semibold text-black transition hover:bg-[#ff914d]/90 active:scale-95 shadow-[0_4px_28px_rgba(255,145,77,0.3)]"
              >
                {t.cta.primary}
                <ArrowRight
                  className="h-5 w-5"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </Link>
              <Link
                href={t.cateringHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-sm font-medium text-[#f0ebe3] transition hover:bg-white/[0.06]"
              >
                {t.cta.secondary}
              </Link>
            </div>
            <p className="mt-6 text-xs text-[#4a3f37]">{t.cta.footer}</p>
          </FadeUp>
        </div>
      </section>
    </main>
  );
}
