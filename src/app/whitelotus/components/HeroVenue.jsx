"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function HeroVenue() {
  const { language } = useLanguage();
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const [loadingButton, setLoadingButton] = useState(null);

  const translations = {
    en: {
      title: "White Lotus",
      subtitle: "The heart of Downtown Rkv",
      seeEventsButton: "See Events",
      hostEventButton: "Host an Event",
      scrollHint: "Scroll to explore",
    },
    is: {
      title: "White Lotus",
      subtitle: "Hjarta miðbæjar Rvk",
      seeEventsButton: "Sjá viðburði",
      hostEventButton: "Halda viðburð",
      scrollHint: "Skoða meira",
    },
  };

  const t = translations[language] || translations.en;

  const handleButtonClick = (href, buttonId) => {
    setLoadingButton(buttonId);
    router.push(href);
  };

  const scrollToNext = () => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      const nextSection = document.getElementById("whitelotus-gallery");

      if (nextSection) {
        // Get the element's position relative to the document
        const elementTop =
          nextSection.getBoundingClientRect().top + window.pageYOffset;
        const offset = 0; // No offset, scroll to top of element

        // Use scrollTo for better cross-browser compatibility
        window.scrollTo({
          top: elementTop - offset,
          behavior: "smooth",
        });
      } else {
        // Fallback: scroll one viewport height
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
      {/* Background image */}
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { scale: 1.04 }}
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
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-xl lg:max-w-2xl text-center"
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

            {/* Custom Professional Buttons */}
            <div className="mt-8 flex flex-row gap-2 sm:gap-3 justify-center items-center">
              <motion.div
                whileHover={
                  loadingButton !== "events" ? { scale: 1.01, y: -1 } : {}
                }
                whileTap={{ scale: 0.99 }}
                className="flex-1 sm:flex-none sm:w-auto"
              >
                <button
                  onClick={() => handleButtonClick("/events", "events")}
                  disabled={loadingButton === "events"}
                  className="relative overflow-hidden rounded-full backdrop-blur-sm bg-white/8 border border-white/15 text-white text-sm sm:text-base px-5 sm:px-7 py-2.5 sm:py-3 font-light tracking-wide transition-all duration-300 ease-in-out shadow-sm hover:bg-white/12 hover:border-white/25 hover:shadow-md flex items-center justify-center w-full sm:w-auto disabled:cursor-wait"
                >
                  <motion.span
                    className="relative z-10"
                    animate={
                      loadingButton === "events"
                        ? {
                            opacity: [1, 0.5, 1],
                            scale: [1, 1.05, 1],
                          }
                        : {}
                    }
                    transition={{
                      duration: 1.2,
                      repeat: loadingButton === "events" ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  >
                    {t.seeEventsButton}
                  </motion.span>
                  {loadingButton !== "events" && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-[#ff914d]/15 via-[#ffa866]/15 to-[#ff914d]/15"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
              </motion.div>

              <motion.div
                whileHover={
                  loadingButton !== "rent" ? { scale: 1.01, y: -1 } : {}
                }
                whileTap={{ scale: 0.99 }}
                className="flex-1 sm:flex-none sm:w-auto"
              >
                <button
                  onClick={() => handleButtonClick("/whitelotus/rent", "rent")}
                  disabled={loadingButton === "rent"}
                  className="relative overflow-hidden rounded-full backdrop-blur-sm bg-white/8 border border-white/15 text-white text-sm sm:text-base px-5 sm:px-7 py-2.5 sm:py-3 font-light tracking-wide transition-all duration-300 ease-in-out shadow-sm hover:bg-white/12 hover:border-white/25 hover:shadow-md flex items-center justify-center w-full sm:w-auto disabled:cursor-wait"
                >
                  <motion.span
                    className="relative z-10"
                    animate={
                      loadingButton === "rent"
                        ? {
                            opacity: [1, 0.5, 1],
                            scale: [1, 1.05, 1],
                          }
                        : {}
                    }
                    transition={{
                      duration: 1.2,
                      repeat: loadingButton === "rent" ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  >
                    {t.hostEventButton}
                  </motion.span>
                  {loadingButton !== "rent" && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500/15 via-indigo-400/15 to-indigo-500/15"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll cue — centered, pinned low */}
        <motion.button
          type="button"
          onClick={scrollToNext}
          className="absolute bottom-6 sm:bottom-8 left-0 right-0 mx-auto w-fit flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors select-none"
          aria-label={t.scrollHint}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
        >
          <span className="text-[11px] tracking-[0.22em] uppercase text-center whitespace-nowrap">
            {t.scrollHint}
          </span>
          <motion.div
            className="w-10 h-10 rounded-full border border-white/25 bg-white/10 backdrop-blur flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.35)] mx-auto"
            animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <ChevronDownIcon className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
}
