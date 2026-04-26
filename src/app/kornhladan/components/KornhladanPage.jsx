"use client";

/**
 * KornhladanPage — elegant teaser landing for /kornhladan on mama.is.
 *
 * Strategy:
 *   - Concentrate ranking on mama.is for "Kornhlaðan", "corporate venue
 *     Reykjavík", "wedding hall Bankastræti 2", etc.
 *   - Funnel booking traffic out to https://www.kornhladan.is/ (the dedicated
 *     booking experience). Outbound link uses target="_blank" rel="noopener"
 *     (no nofollow, no noreferrer) so Google passes link equity.
 *
 * Visual:
 *   - Borrows the Kornhlaðan brand palette (ink #0b0a08 / cream #ede7db /
 *     brass #c9985b) for thematic continuity with the destination site, but
 *     reuses Mama's existing serif (Cormorant Garamond) and Tailwind tokens
 *     so it slots into the rest of mama.is without new fonts or build steps.
 */

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const CLOUDINARY = "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto";
const HERO = `${CLOUDINARY}/v1762152239/korn_7_mktawg.jpg`;
const TABLES = `${CLOUDINARY}/v1762151400/kornhladan_f449cp.jpg`;
const CEREMONY = `${CLOUDINARY}/v1762151400/DSC04126_csuq9x.jpg`;
const WEDDING = `${CLOUDINARY}/v1762151401/white_lotus_wedding_ceremony_ju7bpe.jpg`;
const STAGE = `${CLOUDINARY}/v1762152240/korn1_a1pwc5.jpg`;

const KORNHLADAN_URL = "https://www.kornhladan.is/";
const KORNHLADAN_BOOK = "https://www.kornhladan.is/book";

const COPY = {
  en: {
    hero: {
      eyebrow: "Bankastræti 2 · Reykjavík · Since 1834",
      title: "Kornhlaðan",
      subtitle:
        "A historic grain warehouse turned event hall — quietly anchoring downtown Reykjavík for nearly two centuries.",
      cta: "Visit kornhladan.is",
      ctaSecondary: "See the space",
    },
    story: {
      label: "The Story",
      heading: "Two centuries of gathering at Bankastræti 2",
      body:
        "Built in 1834, Kornhlaðan was Reykjavík's working grain warehouse, then a bakery, and today a venue. The thick stone walls, original timber, and warm proportions still hold the same dignity they did when the city was a few hundred souls. It sits next to Mama Reykjavík and White Lotus — the third room in our small family of spaces on Bankastræti 2.",
    },
    space: {
      label: "The Space",
      heading: "111 m² — flexible, fully equipped, deeply rooted",
      facts: [
        { k: "Capacity", v: "85 seated · 150 standing" },
        { k: "Hours", v: "Private bookings, day or night" },
        { k: "Sound", v: "Professional PA + microphones" },
        { k: "Lighting", v: "Adjustable warm lighting" },
        { k: "Bar", v: "Full licensed bar, custom cocktail menus" },
        { k: "Catering", v: "In-house chef and Mama Reykjavík kitchen" },
      ],
    },
    uses: {
      label: "What it holds",
      heading: "Built for moments that matter",
      cards: [
        {
          title: "Corporate events",
          body:
            "Annual parties, product launches, team offsites, all-hands dinners, panel evenings, awards. Walk in, plug in, present — projector and PA included.",
          tag: "Most-booked",
        },
        {
          title: "Weddings & private",
          body:
            "Ceremony, reception, dinner, dance — all in the same room. The brick and timber do most of the styling for you. Up to 150 guests.",
          tag: null,
        },
      ],
    },
    bridge: {
      heading: "Plan your event",
      body:
        "For full details — the gallery, FAQ, availability calendar, and booking — visit our dedicated site. Tailored quotes typically arrive within 24 hours.",
      cta: "Open kornhladan.is",
      ctaSecondary: "Inquire about a date",
    },
  },
  is: {
    hero: {
      eyebrow: "Bankastræti 2 · Reykjavík · Síðan 1834",
      title: "Kornhlaðan",
      subtitle:
        "Söguleg kornhlaða orðin að veislusal — hjarta miðbæjarins í tæp tvö hundruð ár.",
      cta: "Heimsækja kornhladan.is",
      ctaSecondary: "Sjá rýmið",
    },
    story: {
      label: "Sagan",
      heading: "Tvær aldir af samkomum á Bankastræti 2",
      body:
        "Reist 1834 var Kornhlaðan vinnandi kornhlaða Reykjavíkur, síðan bakarí og í dag veislusalur. Þykkir steinveggir, upprunaleg viður og hlý hlutföll halda enn sömu reisn og þegar borgin taldi nokkur hundruð íbúa. Hún stendur við hlið Mama Reykjavík og White Lotus — þriðji salurinn í litlu fjölskyldunni okkar á Bankastræti 2.",
    },
    space: {
      label: "Salurinn",
      heading: "111 m² — sveigjanlegur, fullbúinn, sögulegur",
      facts: [
        { k: "Stærð", v: "85 sitjandi · 150 standandi" },
        { k: "Tími", v: "Einkaleiga, dag eða kvöld" },
        { k: "Hljóð", v: "Atvinnuhljóðkerfi + hljóðnemar" },
        { k: "Lýsing", v: "Stillanleg hlý lýsing" },
        { k: "Bar", v: "Fullt vínveitingaleyfi, sérsniðnir kokteilar" },
        { k: "Veitingar", v: "Eldhús staðarins og Mama Reykjavík" },
      ],
    },
    uses: {
      label: "Til hvers",
      heading: "Hannað fyrir augnablik sem skipta máli",
      cards: [
        {
          title: "Fyrirtækjaviðburðir",
          body:
            "Árshátíðir, vörukynningar, vinnufundir, kvöldverðir, pallborð, viðurkenningar. Gakktu inn, tengdu þig, byrjaðu — skjávarpi og hljóðkerfi innifalið.",
          tag: "Mest bókað",
        },
        {
          title: "Brúðkaup & einkasamkvæmi",
          body:
            "Athöfn, móttaka, kvöldverður, dans — allt í sama sal. Steinninn og viðurinn sjá um meirihluta stílsins. Allt að 150 gestir.",
          tag: null,
        },
      ],
    },
    bridge: {
      heading: "Skipuleggðu viðburðinn þinn",
      body:
        "Fyrir öll smáatriði — myndasafn, algengar spurningar, dagatal og bókun — heimsæktu sérsniðnu vefinn okkar. Sérsniðin tilboð berast venjulega innan 24 klst.",
      cta: "Opna kornhladan.is",
      ctaSecondary: "Spyrjast um dag",
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function KornhladanPage({ locale = "en" }) {
  const t = COPY[locale === "is" ? "is" : "en"];

  return (
    <main
      className="bg-[#0b0a08] text-[#ede7db]"
      style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}
    >
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden">
        <Image
          src={HERO}
          alt="Kornhlaðan — historic event venue at Bankastræti 2, Reykjavík"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_95%_88%_at_50%_44%,rgba(11,10,8,0.30)_0%,rgba(11,10,8,0.55)_38%,rgba(11,10,8,0.92)_100%)]"
        />

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="relative z-10 mx-auto max-w-3xl px-6 text-center"
        >
          <p className="mb-8 text-[10px] uppercase tracking-[0.4em] text-[#c9985b]">
            {t.hero.eyebrow}
          </p>
          <h1 className="font-light leading-[0.95] text-[clamp(3.5rem,11vw,8rem)]">
            {t.hero.title}
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-[#d9d2c4]">
            {t.hero.subtitle}
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={KORNHLADAN_BOOK}
              target="_blank"
              rel="noopener"
              className="group inline-flex items-center gap-3 rounded-full bg-[#c9985b] px-8 py-3.5 text-sm font-medium uppercase tracking-[0.18em] text-[#0b0a08] transition-colors duration-300 hover:bg-[#dcac6d]"
            >
              {t.hero.cta}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="#space"
              className="text-sm uppercase tracking-[0.18em] text-[#a89b8a] underline-offset-8 transition-colors duration-300 hover:text-[#ede7db] hover:underline"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── STORY ────────────────────────────────────────────────────── */}
      <section className="relative px-6 py-28 lg:py-36">
        <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
          >
            <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-[#c9985b]">
              {t.story.label}
            </p>
            <h2 className="font-light leading-[1.05] text-[clamp(2rem,5vw,3.25rem)]">
              {t.story.heading}
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-[#d9d2c4]">{t.story.body}</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="relative aspect-[4/5] overflow-hidden rounded-sm"
          >
            <Image
              src={CEREMONY}
              alt="Kornhlaðan ready for a ceremony — chairs arranged at Bankastræti 2"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#0b0a08]/60 via-transparent to-transparent"
            />
          </motion.div>
        </div>
      </section>

      {/* ── THE SPACE ────────────────────────────────────────────────── */}
      <section id="space" className="relative bg-[#111010] px-6 py-28 lg:py-36">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="mb-16 max-w-2xl"
          >
            <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-[#c9985b]">
              {t.space.label}
            </p>
            <h2 className="font-light leading-[1.05] text-[clamp(2rem,5vw,3.25rem)]">
              {t.space.heading}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {t.space.facts.map((f, i) => (
              <motion.div
                key={f.k}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp}
                transition={{ delay: i * 0.05 }}
                className="border-t border-[#26232a] pt-6"
              >
                <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[#8f6a3a]">
                  {f.k}
                </p>
                <p className="text-xl font-light text-[#ede7db]">{f.v}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="relative mt-20 aspect-[16/9] overflow-hidden rounded-sm"
          >
            <Image
              src={TABLES}
              alt="Kornhlaðan set with dining tables for a corporate event in Reykjavík"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* ── USE CASES ────────────────────────────────────────────────── */}
      <section className="relative px-6 py-28 lg:py-36">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="mb-16 max-w-2xl"
          >
            <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-[#c9985b]">
              {t.uses.label}
            </p>
            <h2 className="font-light leading-[1.05] text-[clamp(2rem,5vw,3.25rem)]">
              {t.uses.heading}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {t.uses.cards.map((card, i) => (
              <motion.article
                key={card.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                transition={{ delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-sm border border-[#26232a] bg-[#111010]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={i === 0 ? STAGE : WEDDING}
                    alt={card.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-[#0b0a08] via-[#0b0a08]/30 to-transparent"
                  />
                  {card.tag && (
                    <span className="absolute left-5 top-5 rounded-full bg-[#c9985b]/95 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#0b0a08]">
                      {card.tag}
                    </span>
                  )}
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-light text-[#ede7db]">{card.title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-[#a89b8a]">{card.body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRIDGE TO kornhladan.is ──────────────────────────────────── */}
      <section className="relative bg-[#111010] px-6 py-28 lg:py-32">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-light leading-[1.05] text-[clamp(2rem,5vw,3rem)]">
            {t.bridge.heading}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#d9d2c4]">
            {t.bridge.body}
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={KORNHLADAN_URL}
              target="_blank"
              rel="noopener"
              className="group inline-flex items-center gap-3 rounded-full bg-[#c9985b] px-8 py-3.5 text-sm font-medium uppercase tracking-[0.18em] text-[#0b0a08] transition-colors duration-300 hover:bg-[#dcac6d]"
            >
              {t.bridge.cta}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">↗</span>
            </a>
            <a
              href={KORNHLADAN_BOOK}
              target="_blank"
              rel="noopener"
              className="text-sm uppercase tracking-[0.18em] text-[#a89b8a] underline-offset-8 transition-colors duration-300 hover:text-[#ede7db] hover:underline"
            >
              {t.bridge.ctaSecondary}
            </a>
          </div>

          {/* Family-of-venues breadcrumb — keeps users in the Mama universe */}
          <div className="mt-20 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-[0.3em] text-[#7e7464]">
            <Link href="/restaurant" className="transition-colors hover:text-[#ede7db]">
              Mama Reykjavík
            </Link>
            <span aria-hidden className="text-[#554e43]">·</span>
            <Link href="/whitelotus" className="transition-colors hover:text-[#ede7db]">
              White Lotus
            </Link>
            <span aria-hidden className="text-[#554e43]">·</span>
            <span className="text-[#c9985b]">Kornhlaðan</span>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
