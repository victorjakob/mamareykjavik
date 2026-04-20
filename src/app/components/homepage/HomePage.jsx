"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import CommunityMembershipSection from "@/app/components/community/CommunityMembershipSection";

const RESTAURANT_POSTER =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1600,q_auto,f_auto/v1776181244/Mamawalkthroushscreen_bmljjp.png";

// ── Images ─────────────────────────────────────────────────────────────────────
const FRONT_IMG =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1920/v1776000793/front-img_pcepoh.heic";
const IMG_DAHL =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1762326608/dahl_aumxpm.jpg";
const IMG_CACAO =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1752238745/ceremonial-cacao-cup_twp40h.jpg";

// ── Animation variants ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: "easeOut" },
  },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

function FadeSection({ children, className = "", navbarTheme }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      data-navbar-theme={navbarTheme}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────────
const paths = [
  {
    title: "Mama Restaurant",
    description: "Honest, real food — made with love, rooted in the world.",
    image: "/mamaimg/mamavibe1.jpg",
    logo: "/mamaimg/mamalogo.png",
    link: "/restaurant",
    cta: "Come eat",
    align: "self-start",
  },
  {
    title: "White Lotus",
    description: "Ceremonies, music, yoga, and gatherings that open the heart.",
    image:
      "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1766576002/wl-cover_yzyuhz.jpg",
    logo: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1766567396/wl-darkbg_lfm9ye.png",
    link: "/whitelotus",
    cta: "Step inside",
    align: "self-end",
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

// ── Sub-components ─────────────────────────────────────────────────────────────
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
            scale: 1.08,
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

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

      <motion.div
        className="absolute inset-0 bg-[#ff914d]"
        variants={{
          rest: { opacity: 0 },
          hover: {
            opacity: 0.08,
            transition: { duration: 0.6, ease: "easeOut" },
          },
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center p-6 md:p-10 translate-y-0 group-hover:-translate-y-1 transition-transform duration-500">
        <div className={`relative w-14 h-14 md:w-24 md:h-24 ${path.align}`}>
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
          <p className="text-center max-w-xs text-sm md:text-base text-white/80 mb-6 px-2">
            {path.description}
          </p>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-white/80 group-hover:text-white group-hover:gap-3 transition-all duration-300">
              <span className="text-xs md:text-sm font-light tracking-[0.2em] uppercase">
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


function ReviewCard({ r }) {
  return (
    <motion.div
      variants={fadeUp}
      className="text-left p-6 rounded-2xl bg-white/[0.03] border border-white/5"
    >
      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-[#ff914d] text-sm">
            ★
          </span>
        ))}
      </div>
      <p className="font-cormorant font-light italic text-[#c4b8aa] text-lg leading-relaxed mb-6">
        &ldquo;{r.text}&rdquo;
      </p>
      <div>
        <p className="text-[#f0ebe3] text-sm font-semibold">{r.author}</p>
        <p className="text-[#8a7e72] text-xs">{r.location}</p>
      </div>
    </motion.div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function HomePage() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = RESTAURANT_POSTER;
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div className="w-full bg-[#110f0d] text-[#f0ebe3] overflow-x-hidden">
      <h1 className="sr-only">
        Mama Reykjavik — Plant-Based Restaurant and Community Events in Iceland
      </h1>

      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section
        data-navbar-theme="light"
        className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
      >
        <Image
          src={FRONT_IMG}
          alt="Mama Reykjavik — nourishing food and conscious community in Reykjavik"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/25 to-black/75" />
        <div className="relative z-10 text-center px-6 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-6"
          >
            <Image
              src="/mamaimg/mamalogo.png"
              alt="Mama Reykjavik"
              width={72}
              height={72}
              className="object-contain mx-auto opacity-90"
            />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-[6rem] font-light tracking-tight text-white leading-tight md:leading-none md:pb-4 mb-4"
          >
            Mama Reykjavík
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="text-sm md:text-base text-white/70 max-w-sm font-light tracking-[0.25em] uppercase mb-10"
          >
            Nourishing food · Sacred gatherings · Community
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/restaurant"
              className="px-8 py-3.5 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide hover:scale-105 transition-all duration-200"
            >
              Eat with us
            </Link>
            <Link
              href="/events"
              className="px-8 py-3.5 border border-white/50 text-white font-semibold rounded-full text-sm tracking-wide hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
            >
              See events
            </Link>
          </motion.div>
        </div>
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-px h-10 bg-gradient-to-b from-white/0 to-white/40" />
          <div className="w-1 h-1 rounded-full bg-white/40" />
        </motion.div>
      </section>

      {/* ── 2. TWO PATHS ─────────────────────────────────────────────────────── */}
      <section data-navbar-theme="light" className="w-full">
        <div className="text-center py-16 px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
            <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">Under one roof</span>
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
          </div>
          <h2 className="font-cormorant text-5xl md:text-7xl font-light italic text-[#f0ebe3]">
            Two doors. One home.
          </h2>
        </div>
        <div className="flex flex-col md:flex-row w-full h-[80vh] max-h-[700px]">
          {paths.map((path) => (
            <PathCard key={path.link} path={path} />
          ))}
        </div>
      </section>

      {/* ── 3. MISSION STRIP ─────────────────────────────────────────────────── */}
      <FadeSection
        navbarTheme="dark"
        className="bg-[#160f0a] border-y border-white/[0.06] py-24 px-6 text-center"
      >
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
          <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">Our belief</span>
          <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
        </motion.div>
        <motion.blockquote
          variants={fadeUp}
          className="font-cormorant text-4xl md:text-6xl lg:text-7xl font-light italic max-w-4xl mx-auto leading-tight text-[#f0ebe3]"
        >
          &ldquo;Food is medicine.
          <br className="hidden md:block" /> Community is healing.&rdquo;
        </motion.blockquote>
        <motion.p
          variants={fadeUp}
          className="mt-10 max-w-2xl mx-auto text-[#a09488] text-base md:text-lg leading-relaxed"
        >
          We are not just a restaurant. We are a gathering place — for people
          who believe that how we eat, how we come together, and how we care for
          one another shapes the world we live in. Born in Reykjavík. Rooted
          everywhere.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-10">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-white/25 text-[#f0ebe3] text-xs tracking-[0.25em] uppercase rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-200"
          >
            Our story <span>→</span>
          </Link>
        </motion.div>
      </FadeSection>

      {/* ── 4. COMMUNITY / MEMBERSHIP ────────────────────────────────────────── */}
      <CommunityMembershipSection />

      {/* ── 5. EVENTS ────────────────────────────────────────────────────────── */}
      <FadeSection navbarTheme="dark" className="bg-[#110f0d] pb-24 pt-0">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 border border-white/[0.06] rounded-2xl overflow-hidden">
            {/* Cacao */}
            <motion.div variants={fadeUp} className="group">
              <Link href="/cacao-prep" className="block h-full">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={IMG_CACAO}
                    alt="Ceremonial cacao at White Lotus, Reykjavik"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a08]/80 to-transparent" />
                </div>
                <div className="bg-[#160f0a] p-7 border-t border-white/[0.04]">
                  <p className="text-[#ff914d] text-xs uppercase tracking-widest mb-2">
                    Sacred
                  </p>
                  <h3 className="text-xl font-bold text-[#f0ebe3] mb-2">
                    Cacao Ceremonies
                  </h3>
                  <p className="text-sm text-[#8a7e72] leading-relaxed">
                    Heart-opening plant medicine circles — ancient, intentional,
                    and deeply nourishing.
                  </p>
                  <div className="mt-5 text-xs text-[#ff914d] uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                    Learn more <span>→</span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Music */}
            <motion.div
              variants={fadeUp}
              className="group border-l border-r border-white/[0.04]"
            >
              <Link href="/events" className="block h-full">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1600/v1776201171/Screenshot_2026-04-14_at_21.17.39_jig1ju.png"
                    alt="Live music and performances at White Lotus"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a08]/80 to-transparent" />
                </div>
                <div className="bg-[#160f0a] p-7 border-t border-white/[0.04]">
                  <p className="text-[#ff914d] text-xs uppercase tracking-widest mb-2">
                    Live
                  </p>
                  <h3 className="text-xl font-bold text-[#f0ebe3] mb-2">
                    Music Nights
                  </h3>
                  <p className="text-sm text-[#8a7e72] leading-relaxed">
                    Intimate acoustic sessions and cultural performances in the
                    heart of White Lotus.
                  </p>
                  <div className="mt-5 text-xs text-[#ff914d] uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                    See events <span>→</span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Venue */}
            <motion.div variants={fadeUp} className="group">
              <Link href="/whitelotus" className="block h-full">
                <div className="h-56 flex items-center justify-center bg-[#110e09]">
                  <span className="text-8xl text-[#ff914d]/25 group-hover:text-[#ff914d]/55 transition-colors duration-500 select-none">
                    ◈
                  </span>
                </div>
                <div className="bg-[#160f0a] p-7 border-t border-white/[0.04]">
                  <p className="text-[#ff914d] text-xs uppercase tracking-widest mb-2">
                    The Space
                  </p>
                  <h3 className="text-xl font-bold text-[#f0ebe3] mb-2">
                    About the Venue
                  </h3>
                  <p className="text-sm text-[#8a7e72] leading-relaxed">
                    An intimate event space for music, movement, ceremony &amp;
                    celebration in downtown Reykjavík.
                  </p>
                  <div className="mt-5 text-xs text-[#ff914d] uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                    Explore White Lotus <span>→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </FadeSection>

      {/* ── 6. SOCIAL PROOF ──────────────────────────────────────────────────── */}
      <FadeSection navbarTheme="dark" className="bg-[#160f0a]">
        <div className="relative overflow-hidden py-24 px-6">
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            aria-hidden="true"
          >
            <Image
              src={IMG_DAHL}
              alt=""
              fill
              className="object-cover blur-3xl scale-110"
            />
          </div>
          <div className="relative max-w-5xl mx-auto text-center">
            <motion.div
              variants={fadeUp}
              className="flex justify-center gap-0.5 mb-4"
            >
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#ff914d]/75 text-lg md:text-xl">
                  ★
                </span>
              ))}
            </motion.div>
            <motion.p
              variants={fadeUp}
              className="font-cormorant font-light text-[#f0ebe3]/95 tabular-nums tracking-tight mb-3"
              style={{ fontSize: "clamp(2.75rem, 6vw, 3.75rem)" }}
            >
              4.9
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-[#a09488] mb-20 text-sm tracking-wide"
            >
              Rated #2 of 504 restaurants in Reykjavík · 426 reviews on
              TripAdvisor
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
              {reviews.map((r) => (
                <ReviewCard key={r.author} r={r} />
              ))}
            </div>
            <motion.div variants={fadeUp} className="mt-12">
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-white/25 text-[#f0ebe3] text-xs tracking-[0.25em] uppercase rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-200"
              >
                Read all reviews <span>→</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </FadeSection>

      {/* ── 7. FIND US ───────────────────────────────────────────────────────── */}
      <FadeSection className="py-28 px-6 bg-[#110f0d] text-center">
        <div className="max-w-xl mx-auto">
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-3 mb-5"
          >
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
            <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">Find us</span>
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-cormorant text-4xl md:text-6xl font-light italic text-[#f0ebe3] mb-6 leading-tight"
          >
            Bankastræti 2,
            <br />
            101 Reykjavík
          </motion.h2>
          <motion.div
            variants={fadeUp}
            className="w-12 h-px bg-[#ff914d]/40 mx-auto mb-8"
          />
          <motion.p variants={fadeUp} className="text-[#a09488] mb-2">
            Open daily · 11:30 – 21:00
          </motion.p>
          <motion.p variants={fadeUp} className="text-[#a09488] mb-12">
            +354 766 6262 · team@mama.is
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <a
              href="https://www.dineout.is/mamareykjavik?isolation=true"
              target="_blank"
              rel="noopener noreferrer"
              className="px-9 py-4 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide hover:scale-105 transition-all duration-200"
            >
              Book a table
            </a>
            <Link
              href="/contact"
              className="px-9 py-4 border border-white/25 text-[#f0ebe3] rounded-full text-sm tracking-wide hover:bg-white/10 transition-all duration-200"
            >
              Get in touch
            </Link>
          </motion.div>
        </div>
      </FadeSection>
    </div>
  );
}
