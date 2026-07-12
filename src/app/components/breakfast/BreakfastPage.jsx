"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

// ── Brand + links ────────────────────────────────────────────────────────────
const MAPS_URL = "https://maps.google.com/?q=Bankastræti+2,+101+Reykjavik";
const EVENT_URL = "https://fb.me/e/6H2RQGLvt";

// ── Cloudinary (folder: Mama/Breakfast — public_ids are flat, no folder prefix)
const CLOUD = "dy8q4hf0k";
const img = (id, w = 760) =>
  `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_${w}/${id}`;
const vid = (id) =>
  `https://res.cloudinary.com/${CLOUD}/video/upload/q_auto/${id}.mp4`;
const frame = (id, w = 760) =>
  `https://res.cloudinary.com/${CLOUD}/video/upload/so_0,f_auto,q_auto,w_${w}/${id}.jpg`;

const HERO_VIDEO = "IMG_6657_gwloa0"; // landscape mp4 640×360
const FEATURE_REEL = "IMG_6654_z0u2tm"; // longest portrait clip (23.7s)

// A lively mix of stills + short clips for the collage
const GALLERY = [
  { type: "img", id: "IMG_6661_qi5h6y" },
  { type: "video", id: "IMG_5877_tyl6tf" },
  { type: "img", id: "IMG_6646_ejf7py" },
  { type: "video", id: "IMG_6655_cpjawf" },
  { type: "img", id: "IMG_6625_vuwo0s" },
  { type: "video", id: "IMG_5881_qs3zsx" },
  { type: "img", id: "IMG_6634_nag8ys" },
  { type: "video", id: "IMG_6656_pjeqnn" },
  { type: "img", id: "IMG_6660_z1rt79" },
  { type: "video", id: "IMG_5878_wv88xl" },
  { type: "img", id: "IMG_6623_capnve" },
  { type: "video", id: "IMG_6654_2_keqhfm" },
  { type: "img", id: "IMG_6608_whzgic" },
  { type: "img", id: "IMG_6615_pzkiqk" },
  { type: "img", id: "IMG_6640_nwxxlp" },
  { type: "img", id: "IMG_6614_nxu4pb" },
  { type: "img", id: "IMG_5875_jlufea" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const CONTENT = {
  en: {
    hero: {
      eyebrow: "Bankastræti 2 · Reykjavík",
      badge: "Now serving · every morning",
      title: "Mornings at Mama",
      sub: "A plant-based breakfast worth waking for. Open from 9, every day.",
      hours: "Served 9:00 – 11:30 daily",
      ctaPrimary: "Get directions",
      ctaSecondary: "See the morning",
    },
    story: {
      eyebrow: "Slow mornings",
      title: "Start the day soft",
      body: "We've never opened this early — now we do. Come in from 9 for a calm room, good light, and a 100% plant-based breakfast made fresh that morning. No rush, no booking. Come as you are, sit down, and let us feed you.",
    },
    details: [
      { k: "When", t: "Every morning", b: "9:00 – 11:30, every day. Then lunch & dinner until 22:00." },
      { k: "Treat", t: "First coffee's on us", b: "Through our opening weeks, your first filter coffee is free with any breakfast." },
      { k: "How", t: "Walk right in", b: "Bankastræti 2, 101 Reykjavík. No booking — breakfast is walk-in." },
    ],
    gallery: { eyebrow: "A Mama morning", title: "Slow mornings, freshly made", alt: "Plant-based breakfast at Mama Reykjavík" },
    reel: { eyebrow: "Press play", title: "This is 9am at Mama" },
    menu: {
      eyebrow: "The menu",
      title: "A taste of the morning",
      note: "Fresh-baked goods, warm bowls, fruit, and proper coffee — all 100% plant-based.",
      coffee: "First filter coffee free · opening weeks",
    },
    faq: {
      eyebrow: "Good to know",
      title: "Breakfast questions",
      items: [
        { q: "What time is breakfast served?", a: "Every day from 9:00 to 11:30. We stay open until 22:00 for lunch and dinner after that." },
        { q: "Is the breakfast vegan?", a: "Yes — 100% plant-based, like everything at Mama. No meat, fish, dairy or eggs." },
        { q: "Do I need to book?", a: "No booking needed — breakfast is walk-in. Just come as you are between 9:00 and 11:30." },
        { q: "Where are you?", a: "Bankastræti 2, 101 Reykjavík — downtown, a minute from Laugavegur." },
        { q: "Is there coffee?", a: "Yes — your first filter coffee is on us with any breakfast through the opening weeks." },
      ],
    },
    closing: {
      title: "See you at 9",
      body: "We're open from 9 every morning. Bring someone you love mornings with.",
      ctaPrimary: "Get directions",
      ctaSecondary: "See the morning",
    },
  },
  is: {
    hero: {
      eyebrow: "Bankastræti 2 · Reykjavík",
      badge: "Nú bjóðum við upp á morgunmat · alla morgna",
      title: "Morgnar hjá Mama",
      sub: "Vegan morgunmatur sem er þess virði að vakna fyrir. Opið frá 9 alla daga.",
      hours: "Morgunmatur er borinn fram daglega 9:00–11:30",
      ctaPrimary: "Fá leiðarlýsingu",
      ctaSecondary: "Sjá morgunstemninguna",
    },
    story: {
      eyebrow: "Rólegir morgnar",
      title: "Byrjaðu daginn mjúklega",
      body: "Við höfum aldrei opnað svona snemma áður — en nú gerum við það. Komdu til okkar frá kl. 9 í rólegt rými, fallega birtu og 100% vegan morgunmat, útbúinn ferskan um morguninn. Enginn flýtir. Engin bókun. Komdu eins og þú ert, sestu niður og leyfðu okkur að sjá um morgunmatinn.",
    },
    details: [
      { k: "Hvenær", t: "Alla morgna", b: "9:00–11:30 alla daga. Eftir það er opið fyrir hádegismat og kvöldmat til 22:00." },
      { k: "Tilboð", t: "Fyrsti kaffibollinn er í boði", b: "Á opnunarvikunum bjóðum við upp á fyrsta uppáhellta kaffið með öllum morgunmat." },
      { k: "Hvernig", t: "Komdu bara við", b: "Bankastræti 2, 101 Reykjavík. Engin bókun — morgunmaturinn er fyrir þá sem koma við." },
    ],
    gallery: { eyebrow: "Mama-morgunn", title: "Rólegir morgnar, ferskur matur", alt: "Vegan morgunmatur hjá Mama Reykjavík" },
    reel: { eyebrow: "Spila", title: "Svona er klukkan 9 hjá Mama" },
    menu: {
      eyebrow: "Matseðillinn",
      title: "Bragð af morgninum",
      note: "Nýbakað, hlýjar skálar, ávextir og gott kaffi — allt 100% vegan.",
      coffee: "Fyrsta uppáhellta kaffið frítt · á opnunarvikunum",
    },
    faq: {
      eyebrow: "Gott að vita",
      title: "Spurt og svarað um morgunmatinn",
      items: [
        { q: "Hvenær er morgunmatur borinn fram?", a: "Alla daga frá 9:00 til 11:30. Eftir það er opið áfram til 22:00 fyrir hádegismat og kvöldmat." },
        { q: "Er morgunmaturinn vegan?", a: "Já — 100% vegan, eins og allt hjá Mama. Ekkert kjöt, enginn fiskur, engar mjólkurvörur og engin egg." },
        { q: "Þarf að bóka?", a: "Nei, það þarf ekki að bóka. Komdu bara eins og þú ert milli 9:00 og 11:30." },
        { q: "Hvar eruð þið?", a: "Bankastræti 2, 101 Reykjavík — í miðbænum, rétt hjá Laugavegi." },
        { q: "Er kaffi?", a: "Já — fyrsta uppáhellta kaffið er í boði með öllum morgunmat á opnunarvikunum." },
      ],
    },
    closing: {
      title: "Sjáumst klukkan 9",
      body: "Við opnum klukkan 9 alla morgna. Taktu með þér einhvern sem þú elskar að eiga rólega morgna með.",
      ctaPrimary: "Fá leiðarlýsingu",
      ctaSecondary: "Sjá morgunstemninguna",
    },
  },
};

function Eyebrow({ children }) {
  return (
    <div className="mb-4 flex items-center justify-center gap-3">
      <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#ff914d]/60" />
      <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">{children}</span>
      <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#ff914d]/60" />
    </div>
  );
}

export default function BreakfastPage() {
  const { language } = useLanguage();
  const t = CONTENT[language] || CONTENT.en;
  const galleryRef = useRef(null);

  const scrollToGallery = () =>
    galleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="relative bg-[#110f0d] text-[#f0ebe3]">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={frame(HERO_VIDEO, 1280)}
        >
          <source src={vid(HERO_VIDEO)} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#110f0d]/70 via-[#110f0d]/40 to-[#110f0d]" />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto max-w-3xl px-5 text-center"
        >
          <span className="mb-5 inline-block rounded-full border border-[#ff914d]/40 bg-[#ff914d]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff914d]">
            {t.hero.badge}
          </span>
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-[#a09488]">{t.hero.eyebrow}</p>
          <h1 className="font-cormorant text-5xl font-light italic leading-[1.05] text-[#f7f1e7] sm:text-6xl md:text-7xl">
            {t.hero.title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[#e6ddd1]">{t.hero.sub}</p>
          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-[#ff914d]">{t.hero.hours}</p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#ff914d] px-8 py-4 text-sm font-semibold tracking-wide text-black shadow-[0_2px_24px_rgba(255,145,77,0.3)] transition-transform duration-200 hover:scale-[1.04]"
            >
              {t.hero.ctaPrimary}
            </a>
            <button
              onClick={scrollToGallery}
              className="rounded-full border border-white/25 px-8 py-4 text-sm font-semibold tracking-wide text-[#f0ebe3] transition-colors duration-200 hover:border-white/60"
            >
              {t.hero.ctaSecondary}
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Story ────────────────────────────────────────────────────────── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-3xl px-5 py-24 text-center"
      >
        <Eyebrow>{t.story.eyebrow}</Eyebrow>
        <h2 className="font-cormorant text-4xl font-light italic text-[#f7f1e7] sm:text-5xl">
          {t.story.title}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#c0b4a8]">
          {t.story.body}
        </p>
      </motion.section>

      {/* ── Details ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 pb-8">
        <div className="grid gap-4 md:grid-cols-3">
          {t.details.map((d, i) => (
            <motion.div
              key={d.k}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 text-center backdrop-blur-sm"
            >
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#ff914d]">{d.k}</p>
              <h3 className="font-cormorant text-2xl italic text-[#f7f1e7]">{d.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#a09488]">{d.b}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Gallery / collage ────────────────────────────────────────────── */}
      <section ref={galleryRef} className="mx-auto max-w-6xl px-5 py-24">
        <div className="text-center">
          <Eyebrow>{t.gallery.eyebrow}</Eyebrow>
          <h2 className="font-cormorant text-4xl font-light italic text-[#f7f1e7] sm:text-5xl">
            {t.gallery.title}
          </h2>
        </div>

        <div className="mt-12 [column-fill:_balance] columns-2 gap-3 md:columns-3 [&>*]:mb-3">
          {GALLERY.map((item) =>
            item.type === "video" ? (
              /* aspect-[9/16] + warm bg reserve the tile's space before the
                 media arrives — the unstyled tiles used to leave viewport-
                 sized blank gaps in the masonry while videos loaded. */
              <video
                key={item.id}
                className="w-full break-inside-avoid rounded-2xl aspect-[9/16] object-cover bg-[#241a12]"
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                poster={frame(item.id)}
              >
                <source src={vid(item.id)} type="video/mp4" />
              </video>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={item.id}
                src={img(item.id)}
                alt={t.gallery.alt}
                loading="lazy"
                className="w-full break-inside-avoid rounded-2xl object-cover aspect-[9/16] bg-[#241a12]"
              />
            )
          )}
        </div>
      </section>

      {/* ── Feature reel ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 pb-24">
        <div className="grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <div className="mx-auto w-full max-w-[300px]">
            <video
              className="w-full rounded-[28px] border border-white/10 shadow-2xl"
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              poster={frame(FEATURE_REEL, 600)}
            >
              <source src={vid(FEATURE_REEL)} type="video/mp4" />
            </video>
          </div>
          <div className="text-center md:text-left">
            <Eyebrow>{t.reel.eyebrow}</Eyebrow>
            <h2 className="font-cormorant text-4xl font-light italic text-[#f7f1e7] sm:text-5xl">
              {t.reel.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[#c0b4a8]">{t.hero.sub}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-[#ff914d]">{t.hero.hours}</p>
          </div>
        </div>
      </section>

      {/* ── Menu teaser ──────────────────────────────────────────────────── */}
      {/* TODO: when the final menu arrives, replace this note with item rows:
          { name, blurb, price } grouped into sections. Keep the free-coffee badge. */}
      <section className="border-y border-white/[0.06] bg-white/[0.02]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto max-w-3xl px-5 py-24 text-center"
        >
          <Eyebrow>{t.menu.eyebrow}</Eyebrow>
          <h2 className="font-cormorant text-4xl font-light italic text-[#f7f1e7] sm:text-5xl">
            {t.menu.title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#c0b4a8]">
            {t.menu.note}
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#ff914d]/40 bg-[#ff914d]/10 px-6 py-3">
            <span className="text-lg">☕</span>
            <span className="text-sm font-semibold tracking-wide text-[#ff914d]">{t.menu.coffee}</span>
          </div>
        </motion.div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pb-24">
        <div className="text-center">
          <Eyebrow>{t.faq.eyebrow}</Eyebrow>
          <h2 className="font-cormorant text-4xl font-light italic text-[#f7f1e7] sm:text-5xl">
            {t.faq.title}
          </h2>
        </div>
        <div className="mt-10 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {t.faq.items.map((it) => (
            <details key={it.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-lg text-[#f0ebe3]">
                {it.q}
                <span className="text-[#ff914d] transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-[#a09488]">{it.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <img
          // eslint-disable-next-line @next/next/no-img-element
          src={img("IMG_6646_ejf7py", 1400)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[#110f0d]/80" />
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative z-10 mx-auto max-w-2xl px-5 py-28 text-center"
        >
          <h2 className="font-cormorant text-5xl font-light italic text-[#f7f1e7] sm:text-6xl">
            {t.closing.title}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-[#e6ddd1]">{t.closing.body}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#ff914d] px-8 py-4 text-sm font-semibold tracking-wide text-black shadow-[0_2px_24px_rgba(255,145,77,0.3)] transition-transform duration-200 hover:scale-[1.04]"
            >
              {t.closing.ctaPrimary}
            </a>
            <a
              href={EVENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/25 px-8 py-4 text-sm font-semibold tracking-wide text-[#f0ebe3] transition-colors duration-200 hover:border-white/60"
            >
              {t.closing.ctaSecondary}
            </a>
          </div>
          <p className="mt-8 text-xs uppercase tracking-[0.25em] text-[#a09488]">
            Mama · Bankastræti 2 · 101 Reykjavík
          </p>
        </motion.div>
      </section>
    </div>
  );
}
