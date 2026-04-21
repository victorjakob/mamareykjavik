"use client";

import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useRef, useEffect } from "react";
import CommunityMembershipSection from "@/app/components/community/CommunityMembershipSection";

// ── Images ───────────────────────────────────────────────────────────────────
const FRONT_IMG =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1920/v1776000793/front-img_pcepoh.heic";
const IMG_DAHL =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1762326608/dahl_aumxpm.jpg";
const IMG_CACAO =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1752238745/ceremonial-cacao-cup_twp40h.jpg";
const IMG_MUSIC =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1600/v1776201171/Screenshot_2026-04-14_at_21.17.39_jig1ju.png";
const IMG_WL =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1766576002/wl-cover_yzyuhz.jpg";
const RESTAURANT_POSTER =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1600,q_auto,f_auto/v1776181244/Mamawalkthroushscreen_bmljjp.png";

// ── Ticker items ─────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "Plant-Based Kitchen",
  "Ceremonial Cacao",
  "Reykjavík",
  "Live Music",
  "Yoga & Workshops",
  "Community",
  "World Cuisine",
  "Sacred Gatherings",
  "White Lotus Venue",
  "Conscious Living",
];

// ── What We Do data ──────────────────────────────────────────────────────────
const WHAT_WE_DO = [
  {
    category: "Sacred",
    title: "Ceremonial\nCacao",
    description:
      "Heart-opening plant medicine circles — ancient, intentional, and deeply nourishing for body and soul.",
    image: IMG_CACAO,
    link: "/cacao-prep",
    cta: "Learn more",
  },
  {
    category: "Live",
    title: "Music\nNights",
    description:
      "Intimate acoustic sessions and cultural performances in the heart of White Lotus.",
    image: IMG_MUSIC,
    link: "/events",
    cta: "See events",
  },
  {
    category: "Movement",
    title: "Yoga &\nWorkshops",
    description:
      "Breathwork, movement, and conscious living practices for all levels, all hearts.",
    image: IMG_WL,
    link: "/events",
    cta: "See events",
  },
  {
    category: "Nourish",
    title: "Plant-Based\nKitchen",
    description:
      "World-inspired flavours, honest ingredients, and food made with care. Every plate a small act of love.",
    image: IMG_DAHL,
    link: "/restaurant",
    cta: "See menu",
  },
];

// ── Path data ────────────────────────────────────────────────────────────────
const paths = [
  {
    title: "Mama Restaurant",
    description: "Honest, real food — made with love, rooted in the world.",
    image: "/mamaimg/mamavibe1.jpg",
    logo: "/mamaimg/mamalogo.png",
    link: "/restaurant",
    cta: "Come eat",
  },
  {
    title: "White Lotus",
    description: "Ceremonies, music, yoga, and gatherings that open the heart.",
    image: IMG_WL,
    logo: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1766567396/wl-darkbg_lfm9ye.png",
    link: "/whitelotus",
    cta: "Step inside",
  },
];

const reviews = [
  {
    text: "Best restaurant, not just plant-based, in Iceland. The dhal alone is worth the trip to Reykjavik.",
    author: "James H.",
    location: "United Kingdom",
  },
  {
    text: "A gastronomic experience that moved me. The food, the space, the people — Mama is something special.",
    author: "Lena M.",
    location: "Germany",
  },
  {
    text: "I've been to vegan restaurants all over the world. Mama is in a league of its own.",
    author: "Sofia R.",
    location: "United States",
  },
];

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

// ── Vibe Ticker ──────────────────────────────────────────────────────────────
function VibeTicker() {
  const reduceMotion = useReducedMotion();
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div
      data-navbar-theme="dark"
      className="w-full overflow-hidden bg-[#0d0b09] border-y border-white/[0.06] py-4"
    >
      <motion.div
        className="flex gap-0 whitespace-nowrap"
        animate={reduceMotion ? {} : { x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-4 px-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#a09488]">
              {item}
            </span>
            <span className="text-[#ff914d]/35 text-xs">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Path Card ─────────────────────────────────────────────────────────────────
const MotionLink = motion(Link);

function PathCard({ path }) {
  return (
    <MotionLink
      href={path.link}
      className="group relative flex-1 h-[50vh] md:h-full overflow-hidden"
      initial="rest"
      animate="rest"
      whileHover="hover"
    >
      <motion.div
        className="absolute inset-0"
        variants={{
          rest: { scale: 1 },
          hover: {
            scale: 1.06,
            transition: { duration: 3, ease: [0.25, 0.1, 0.25, 1] },
          },
        }}
      >
        <Image
          src={path.image}
          alt={path.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/15" />
      <motion.div
        className="absolute inset-0 bg-[#ff914d]"
        variants={{
          rest: { opacity: 0 },
          hover: { opacity: 0.07, transition: { duration: 0.6 } },
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center p-6 md:p-10">
        <div className="relative w-14 h-14 md:w-20 md:h-20">
          <Image
            src={path.logo}
            alt={`${path.title} logo`}
            fill
            className="object-contain"
          />
        </div>
        <div className="flex-1 flex flex-col justify-end items-center text-white pb-4 md:pb-8">
          <h3 className="text-2xl md:text-4xl font-semibold text-center mb-2">
            {path.title}
          </h3>
          <p className="text-center max-w-xs text-sm md:text-base text-white/75 mb-6 px-2">
            {path.description}
          </p>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-white/80 group-hover:text-white group-hover:gap-3 transition-all duration-300">
              <span className="text-xs font-light tracking-[0.2em] uppercase">
                {path.cta}
              </span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                →
              </motion.span>
            </div>
            <div className="h-px w-20 overflow-hidden bg-white/15">
              <motion.div
                className="h-full w-full origin-left bg-[#ff914d]"
                variants={{
                  rest: { scaleX: 0 },
                  hover: {
                    scaleX: 1,
                    transition: { duration: 0.45, ease: "easeOut" },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </MotionLink>
  );
}

// ── What We Do Card ───────────────────────────────────────────────────────────
function WhatWeDoCard({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.1,
      }}
      className="group relative overflow-hidden rounded-2xl"
      style={{ aspectRatio: "4/5" }}
    >
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={item.image}
          alt={item.title.replace("\n", " ")}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
      </div>

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
      <div className="absolute inset-0 bg-[#ff914d]/0 group-hover:bg-[#ff914d]/[0.06] transition-colors duration-500" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-7">
        <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#ff914d] mb-2.5">
          {item.category}
        </span>
        <h3
          className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-3 whitespace-pre-line"
          style={{ fontSize: "clamp(1.8rem, 2.5vw, 2.4rem)" }}
        >
          {item.title}
        </h3>
        <p className="text-sm text-[#b0a498] leading-relaxed mb-5 max-w-xs opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
          {item.description}
        </p>
        <Link
          href={item.link}
          className="inline-flex items-center gap-2 text-xs text-[#ff914d] uppercase tracking-[0.25em] group-hover:gap-3 transition-all duration-300"
        >
          {item.cta} →
        </Link>
      </div>

      {/* Corner accent */}
      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span className="text-[#ff914d]/50 text-lg">✦</span>
      </div>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function HomePageRedesign() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = RESTAURANT_POSTER;
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // Hero parallax
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImgY = useTransform(heroScroll, [0, 1], ["0%", "18%"]);
  const heroContentOpacity = useTransform(heroScroll, [0, 0.55], [1, 0]);

  return (
    <div className="w-full bg-[#110f0d] text-[#f0ebe3] overflow-x-hidden">
      <h1 className="sr-only">
        Mama Reykjavik — Plant-Based Restaurant & Community Events in Iceland
      </h1>

      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        data-navbar-theme="light"
        className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
      >
        {/* Ken Burns + parallax */}
        <motion.div
          className="absolute inset-0"
          style={reduceMotion ? {} : { y: heroImgY }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1.0 }}
            transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={FRONT_IMG}
              alt="Mama Reykjavik — nourishing food and conscious community in Reykjavik"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/20 to-black/80" />

        {/* Hero content fades on scroll */}
        <motion.div
          className="relative z-10 text-center px-6 flex flex-col items-center"
          style={reduceMotion ? {} : { opacity: heroContentOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mb-7"
          >
            <Image
              src="/mamaimg/mamalogo.png"
              alt="Mama Reykjavik"
              width={68}
              height={68}
              className="object-contain mx-auto opacity-90"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.1,
              delay: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="font-cormorant font-light italic text-white leading-tight mb-4"
            style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)" }}
          >
            Mama Reykjavík
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="text-sm text-white/65 max-w-sm font-light tracking-[0.28em] uppercase mb-10"
          >
            Nourishing food · Sacred gatherings · Community
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 1.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex flex-row flex-wrap justify-center gap-2 sm:gap-3"
          >
            <Link
              href="/restaurant"
              className="px-6 sm:px-9 py-3.5 bg-[#ff914d] text-black font-semibold rounded-full text-xs sm:text-sm tracking-wide hover:scale-[1.04] hover:bg-[#ff914d]/90 transition-all duration-200 shadow-[0_2px_20px_rgba(255,145,77,0.3)]"
            >
              Eat with us
            </Link>
            <Link
              href="/events"
              className="px-6 sm:px-9 py-3.5 border border-white/45 text-white font-semibold rounded-full text-xs sm:text-sm tracking-wide hover:bg-white/10 hover:border-white/65 transition-all duration-200 backdrop-blur-sm"
            >
              See events
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
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

      {/* ── 3. TWO PATHS ─────────────────────────────────────────────────────── */}
      <section data-navbar-theme="dark" className="w-full">
        <div className="text-center py-16 px-6">
          <FadeUp>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
              <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">
                Under one roof
              </span>
              <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
            </div>
            <h2
              className="font-cormorant font-light italic text-[#f0ebe3]"
              style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)" }}
            >
              Two doors. One home.
            </h2>
          </FadeUp>
        </div>
        <div className="flex flex-col md:flex-row w-full h-[80vh] max-h-[700px]">
          {paths.map((path) => (
            <PathCard key={path.link} path={path} />
          ))}
        </div>
      </section>

      {/* ── 4. MISSION QUOTE ─────────────────────────────────────────────────── */}
      <section
        data-navbar-theme="dark"
        className="relative bg-[#160f0a] border-y border-white/[0.06] py-28 px-6 text-center overflow-hidden"
      >
        {/* Faint watermark word */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden
        >
          <span
            className="font-cormorant font-light italic text-white/[0.025]"
            style={{
              fontSize: "clamp(8rem, 22vw, 18rem)",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            Mama
          </span>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <FadeUp>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
              <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">
                Our belief
              </span>
              <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <blockquote
              className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-10"
              style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)" }}
            >
              &ldquo;Food is medicine.
              <br className="hidden md:block" /> Community is healing.&rdquo;
            </blockquote>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="max-w-2xl mx-auto text-[#a09488] text-base md:text-lg leading-relaxed mb-10">
              We are not just a restaurant. We are a gathering place, for people
              who believe that how we eat, how we come together, and how we care
              for one another shapes the world we live in. Born in Reykjavík.
              Rooted everywhere.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-white/20 text-[#f0ebe3] text-xs tracking-[0.25em] uppercase rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-200"
            >
              Our story →
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ── 5. WHAT WE DO ────────────────────────────────────────────────────── */}
      <section data-navbar-theme="dark" className="bg-[#110f0d] py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
              <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">
                What we do
              </span>
              <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
            </div>
            <h2
              className="font-cormorant font-light italic text-[#f0ebe3] leading-tight"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 4rem)" }}
            >
              A place to nourish,
              <br />
              gather &amp; feel alive
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHAT_WE_DO.map((item, i) => (
              <WhatWeDoCard key={item.title} item={item} index={i} />
            ))}
          </div>

          <FadeUp delay={0.3} className="text-center mt-12">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/20 text-[#f0ebe3] text-xs tracking-[0.25em] uppercase rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-200"
            >
              All upcoming events →
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ── 6. VIBE TICKER ─────────────────────────────────────────────────────── */}
      <VibeTicker />

      {/* ── 7. COMMUNITY / MEMBERSHIP ────────────────────────────────────────── */}
      <CommunityMembershipSection />

      {/* ── 7. SOCIAL PROOF ──────────────────────────────────────────────────── */}
      <section
        data-navbar-theme="dark"
        className="relative bg-[#160f0a] py-28 px-6 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          aria-hidden
        >
          <Image
            src={IMG_DAHL}
            alt=""
            fill
            className="object-cover blur-3xl scale-110"
          />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <FadeUp>
            <div className="flex justify-center gap-0.5 mb-5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#ff914d]/75 text-xl">
                  ★
                </span>
              ))}
            </div>
            <p
              className="font-cormorant font-light text-[#f0ebe3]/95 tabular-nums tracking-tight mb-3"
              style={{ fontSize: "clamp(3rem, 7vw, 5rem)" }}
            >
              4.9
            </p>
            <p className="text-[#a09488] mb-20 text-sm tracking-wide">
              Rated #2 of 504 restaurants in Reykjavík · 426 reviews on
              TripAdvisor
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {reviews.map((r, i) => (
              <FadeUp key={r.author} delay={i * 0.1}>
                <div className="p-7 rounded-2xl bg-white/[0.03] border border-white/[0.06] h-full">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className="text-[#ff914d] text-sm">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="font-cormorant font-light italic text-[#c4b8aa] text-lg leading-relaxed mb-6">
                    &ldquo;{r.text}&rdquo;
                  </p>
                  <div>
                    <p className="text-[#f0ebe3] text-sm font-semibold">
                      {r.author}
                    </p>
                    <p className="text-[#8a7e72] text-xs">{r.location}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.3} className="mt-12">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-white/25 text-[#f0ebe3] text-xs tracking-[0.25em] uppercase rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-200"
            >
              Read all reviews →
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ── 8. FIND US ───────────────────────────────────────────────────────── */}
      <section
        data-navbar-theme="dark"
        className="py-28 px-6 bg-[#110f0d] text-center"
      >
        <div className="max-w-xl mx-auto">
          <FadeUp>
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
              <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">
                Find us
              </span>
              <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
            </div>
            <h2
              className="font-cormorant font-light italic text-[#f0ebe3] mb-6 leading-tight"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            >
              Bankastræti 2,
              <br />
              101 Reykjavík
            </h2>
            <div className="w-12 h-px bg-[#ff914d]/40 mx-auto mb-8" />
            <p className="text-[#a09488] mb-2">Open daily · 11:30 – 21:00</p>
            <p className="text-[#a09488] mb-12">+354 766 6262 · team@mama.is</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://www.dineout.is/mamareykjavik?isolation=true"
                target="_blank"
                rel="noopener noreferrer"
                className="px-9 py-4 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide hover:scale-[1.04] hover:bg-[#ff914d]/90 transition-all duration-200 shadow-[0_2px_20px_rgba(255,145,77,0.25)]"
              >
                Book a table
              </a>
              <Link
                href="/contact"
                className="px-9 py-4 border border-white/25 text-[#f0ebe3] rounded-full text-sm tracking-wide hover:bg-white/10 hover:border-white/40 transition-all duration-200"
              >
                Get in touch
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
