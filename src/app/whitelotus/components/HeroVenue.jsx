"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function HeroVenue() {
  const { language } = useLanguage();
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const motionOK = !reduceMotion && !isMobile;

  const translations = {
    en: {
      title: "White Lotus",
      subtitle: "The heart of Downtown Rkv",
      seeEventsButton: "See Events",
      hostEventButton: "Rent the Venue",
      scrollHint: "Scroll to explore",
    },
    is: {
      title: "White Lotus",
      subtitle: "Hjarta miðbæjar Rvk",
      seeEventsButton: "Sjá viðburði",
      hostEventButton: "Leigja Salinn",
      scrollHint: "Skoða meira",
    },
  };

  const t = translations[language] || translations.en;

  const scrollToNext = () => {
    requestAnimationFrame(() => {
      const nextSection = document.getElementById("whitelotus-gallery");

      if (nextSection) {
        const elementTop =
          nextSection.getBoundingClientRect().top + window.pageYOffset;

        window.scrollTo({
          top: elementTop,
          behavior: "smooth",
        });
      } else {
        const viewportHeight =
          window.innerHeight || document.documentElement.clientHeight;
        const currentScroll =
          window.pageYOffset ||
          window.scrollY ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;

        window.scrollTo({
          top: currentScroll + viewportHeight,
          behavior: "smooth",
        });
      }
    });
  };

  return (
    <section className="relative w-full overflow-hidden min-h-screen">
      <h1 className="sr-only">{t.title}</h1>
      {/* Background image */}
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? { scale: 1.0 } : { scale: 1.04 }}
        animate={reduceMotion ? undefined : { scale: 1.0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <Image
          src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1766576002/wl-cover_yzyuhz.jpg"
          alt="White Lotus venue"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={
            isMobile || reduceMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 10 }
          }
          animate={isMobile || reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-xl lg:max-w-2xl text-center"
          suppressHydrationWarning
        >
          {/* Center stack */}
          <div className="mx-auto rounded-3xl px-4 sm:px-7 py-6 sm:py-9">
            <div className="flex justify-center">
              <Image
                src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1766567396/wl-darkbg_lfm9ye.png"
                alt="White Lotus Logo"
                width={1161}
                height={1020}
                className="h-auto w-56 sm:w-56 md:w-64 lg:w-72 xl:w-80 drop-shadow-[0_18px_45px_rgba(0,0,0,0.6)]"
                priority
              />
            </div>

            {/* Harmonized CTA Buttons (Clean + Contrasted) */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full sm:w-auto">
              {/* Primary: Rent the Venue (solid) */}
              <motion.div
                whileHover={isMobile ? undefined : { y: -2 }}
                whileTap={isMobile ? undefined : { scale: 0.98 }}
                className="order-2 sm:order-2 w-full max-w-[70%] lg:max-w-none sm:w-auto"
              >
                <Link
                  href="/whitelotus/rent"
                  className="
                    group relative w-full sm:w-auto inline-flex items-center justify-center
                    h-11 sm:h-12 px-7 sm:px-10 rounded-full
                    text-sm sm:text-[15px] font-medium tracking-wide
                    text-white
                    bg-transparent
                    border-2 border-[#a77d3b]
                    transition-all duration-300 ease-out
                    hover:border-[#b88a4a]
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a77d3b]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40
                    active:translate-y-[1px]
                  "
                >
                  {t.hostEventButton}
                </Link>
              </motion.div>

              {/* Secondary: See Events (ghost) */}
              <motion.div
                whileHover={isMobile ? undefined : { y: -2 }}
                whileTap={isMobile ? undefined : { scale: 0.98 }}
                className="order-1 sm:order-1 w-full max-w-[70%] sm:max-w-none sm:w-auto"
              >
                <Link
                  href="/events"
                  className="
                    group relative w-full sm:w-auto inline-flex items-center justify-center
                    h-11 sm:h-12 px-7 sm:px-10 rounded-full
                    text-sm sm:text-[15px] font-light tracking-wide
                    text-white
                    bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02]
                    border border-white/[0.18]
                    ring-1 ring-white/[0.15] ring-inset
                    backdrop-blur-[8px] backdrop-saturate-150
                    transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                    hover:from-white/[0.14] hover:via-white/[0.09] hover:to-white/[0.04]
                    hover:border-white/[0.28] hover:ring-white/[0.25]
                    hover:backdrop-blur-[10px]
                    shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)]
                    hover:shadow-[0_12px_48px_rgba(167,125,59,0.18),inset_0_1px_0_rgba(255,255,255,0.3)]
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a77d3b]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40
                    active:translate-y-[1px]
                    overflow-hidden
                  "
                >
                  {/* Subtle inner glow on hover */}
                  <span className="absolute inset-0 bg-gradient-to-br from-[#a77d3b]/0 via-[#a77d3b]/0 to-[#a77d3b]/0 group-hover:from-[#a77d3b]/[0.06] group-hover:via-[#a77d3b]/[0.03] group-hover:to-[#a77d3b]/[0.01] transition-all duration-500 pointer-events-none" />
                  <span className="relative z-10">{t.seeEventsButton}</span>
                </Link>
              </motion.div>
            </div>

            {/* Optional: micro text under buttons (remove if you don't want it)
            <p className="mt-4 text-white/70 text-xs tracking-wide">
              {language === "is" ? "Bókaðu eða skoðaðu dagskrána" : "Book the space or explore the program"}
            </p>
            */}
          </div>
        </motion.div>

        {/* Scroll cue — centered, pinned low */}
        <motion.button
          type="button"
          onClick={scrollToNext}
          className="absolute bottom-6 sm:bottom-8 left-0 right-0 mx-auto w-fit flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors select-none"
          aria-label={t.scrollHint}
          initial={
            isMobile || reduceMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 8 }
          }
          animate={isMobile || reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
          suppressHydrationWarning
        >
          <span className="text-[11px] tracking-[0.22em] uppercase text-center whitespace-nowrap">
            {t.scrollHint}
          </span>
          <motion.div
            className="w-10 h-10 rounded-full border border-white/25 bg-white/10 md:backdrop-blur flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.35)] mx-auto"
            animate={motionOK ? { y: [0, 6, 0] } : undefined}
            transition={
              motionOK
                ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                : undefined
            }
          >
            <ChevronDownIcon className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
}
