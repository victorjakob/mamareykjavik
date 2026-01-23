"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Utensils,
  Info,
  Calendar,
  MessageSquare,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import CartIcon from "@/app/components/ui/CartIcon";
import ProfileIcon from "@/app/components/ui/ProfileIcon";
import LanguageToggle from "@/app/components/LanguageToggle";
import { localizeHref } from "@/lib/i18n-routing";

const VARIANTS = {
  top: {
    open: {
      rotate: ["0deg", "0deg", "45deg"],
      top: ["35%", "50%", "50%"],
    },
    closed: {
      rotate: ["45deg", "0deg", "0deg"],
      top: ["50%", "50%", "35%"],
    },
  },
  middle: {
    open: {
      rotate: ["0deg", "0deg", "-45deg"],
    },
    closed: {
      rotate: ["-45deg", "0deg", "0deg"],
    },
  },
  bottom: {
    open: {
      rotate: ["0deg", "0deg", "45deg"],
      bottom: ["35%", "50%", "50%"],
      left: "50%",
    },
    closed: {
      rotate: ["45deg", "0deg", "0deg"],
      bottom: ["50%", "50%", "35%"],
      left: "calc(36% + 5px)",
    },
  },
};

const menuItemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.8,
    rotate: -5,
  },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  }),
};

export default function Desktop() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navButtonRef = useRef(null);
  const menuRef = useRef(null);
  const { cartItemCount } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }

    function handleClickOutside(event) {
      if (
        isNavOpen &&
        !navButtonRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setIsNavOpen(false);
      }
    }

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNavOpen]);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <motion.div
        ref={navButtonRef}
        onClick={toggleNav}
        animate={{
          borderRadius: isNavOpen ? "1rem 1rem 0 0" : "1rem",
          width: isScrolled ? "40%" : "50%",
          height: isScrolled ? "2.5rem" : "4rem",
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="pointer-events-auto fixed top-4 left-1/2 -translate-x-1/2 bg-green-900/50 backdrop-blur-md shadow-sm z-50 hidden lg:block max-w-md mx-auto cursor-pointer"
      >
        <div className="h-full px-8 flex items-center justify-center">
          {/* Main Navigation Items */}
          <div className="flex items-center gap-12" ref={navButtonRef}>
            <motion.div
              animate={{
                scale: isScrolled ? 1.1 : 1,
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="text-center py-2"
            >
              <span className="text-white text-base font-light tracking-normal block leading-none">
                Mama
              </span>
              <motion.span
                className="text-white pt-1 text-sm font-light tracking-normal block leading-none"
                animate={{
                  height: isScrolled ? 0 : "auto",
                  opacity: isScrolled ? 0 : 1,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
              >
                Restaurant
              </motion.span>
            </motion.div>

            {/* Expand Navigation Button */}
            <motion.div
              animate={{
                scale: isScrolled ? 0.9 : 1,
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="relative flex items-center justify-center w-10 h-10 rounded-full transition-colors"
              aria-label={isNavOpen ? "Close menu" : "Open menu"}
            >
              <MotionConfig
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                }}
              >
                <motion.span
                  variants={VARIANTS.top}
                  initial={false}
                  animate={isNavOpen ? "open" : "closed"}
                  className="absolute h-0.5 w-5 bg-white"
                  style={{ y: "-50%", left: "50%", x: "-50%", top: "35%" }}
                />
                <motion.span
                  variants={VARIANTS.middle}
                  initial={false}
                  animate={isNavOpen ? "open" : "closed"}
                  className="absolute h-0.5 w-5 bg-white"
                  style={{ left: "50%", x: "-50%", top: "50%", y: "-50%" }}
                />
                <motion.span
                  variants={VARIANTS.bottom}
                  initial={false}
                  animate={isNavOpen ? "open" : "closed"}
                  className="absolute h-0.5 w-2.5 bg-white"
                  style={{
                    x: "-50%",
                    y: "50%",
                    bottom: "35%",
                    left: "calc(50% + 5px)",
                  }}
                />
              </MotionConfig>
            </motion.div>

            <motion.div
              animate={{
                scale: isScrolled ? 1.1 : 1,
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="text-center py-2"
            >
              <span className="text-white text-base font-light tracking-normal block leading-none">
                White Lotus
              </span>
              <motion.span
                className="text-white text-sm pt-1 font-light tracking-normal block leading-none"
                animate={{
                  height: isScrolled ? 0 : "auto",
                  opacity: isScrolled ? 0 : 1,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
              >
                Venue
              </motion.span>
            </motion.div>
          </div>
        </div>

        {/* Expanded Navigation Menu */}
        <AnimatePresence>
          {isNavOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 right-0 bg-gradient-to-b from-[rgba(250,250,250,0.95)] to-[rgba(245,245,245,0.98)] backdrop-blur-xl border-t border-stone-200/20 overflow-hidden rounded-b-3xl shadow-2xl"
            >
              {/* Ripple effect overlays */}
              <motion.div
                className="absolute top-0 left-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-stone-400/10 to-warm-gray-400/10 backdrop-blur-lg"
                initial={{ scale: 0, x: "-50%", y: "-50%" }}
                animate={{
                  scale: [0, 15],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
              />
              <motion.div
                className="absolute top-0 left-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-stone-400/10 to-warm-gray-400/10 backdrop-blur-lg"
                initial={{ scale: 0, x: "-50%", y: "-50%" }}
                animate={{
                  scale: [0, 12],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.1,
                  ease: "easeOut",
                }}
              />
              <motion.div
                className="absolute top-0 left-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-stone-400/10 to-warm-gray-400/10 backdrop-blur-lg"
                initial={{ scale: 0, x: "-50%", y: "-50%" }}
                animate={{
                  scale: [0, 8],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  ease: "easeOut",
                }}
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="relative z-10"
              >
                <div className="max-w-7xl mx-auto pt-5 px-12 grid grid-cols-2 gap-5">
                  {/* Restaurant Links */}
                  <div className="space-y-6 border-r border-stone-200">
                    <div className="space-y-6 min-w-[200px]">
                      <motion.div
                        custom={0}
                        variants={menuItemVariants}
                        initial="hidden"
                        animate={isNavOpen ? "visible" : "hidden"}
                        whileHover={{
                          scale: 1.05,
                          x: 10,
                          transition: { type: "spring", stiffness: 400 },
                        }}
                      >
                        <Link
                          href={localizeHref(pathname, "/restaurant/book-table")}
                          className="flex items-center gap-4 text-stone-700 hover:text-stone-900 transition-all duration-300 text-base font-normal group whitespace-nowrap"
                        >
                          <span className="bg-stone-100/50 p-2.5 rounded-lg group-hover:bg-stone-200/50 transition-colors duration-300">
                            <BookOpen className="h-5 w-5 text-stone-600 group-hover:text-stone-800 transition-colors" />
                          </span>
                          <span className="group-hover:translate-x-1 transition-transform duration-300">
                            Book Table
                          </span>
                        </Link>
                      </motion.div>
                      <motion.div
                        custom={1}
                        variants={menuItemVariants}
                        initial="hidden"
                        animate={isNavOpen ? "visible" : "hidden"}
                        whileHover={{
                          scale: 1.05,
                          x: 10,
                          transition: { type: "spring", stiffness: 400 },
                        }}
                      >
                        <Link
                          href={localizeHref(pathname, "/restaurant/menu")}
                          className="flex items-center gap-4 text-stone-700 hover:text-stone-900 transition-all duration-300 text-base font-normal group whitespace-nowrap"
                        >
                          <span className="bg-stone-100/50 p-2.5 rounded-lg group-hover:bg-stone-200/50 transition-colors duration-300">
                            <Utensils className="h-5 w-5 text-stone-600 group-hover:text-stone-800 transition-colors" />
                          </span>
                          <span className="group-hover:translate-x-1 transition-transform duration-300">
                            See Menu
                          </span>
                        </Link>
                      </motion.div>
                      <motion.div
                        custom={2}
                        variants={menuItemVariants}
                        initial="hidden"
                        animate={isNavOpen ? "visible" : "hidden"}
                        whileHover={{
                          scale: 1.05,
                          x: 10,
                          transition: { type: "spring", stiffness: 400 },
                        }}
                      >
                        <Link
                          href={localizeHref(pathname, "/about")}
                          className="flex items-center gap-4 text-stone-700 hover:text-stone-900 transition-all duration-300 text-base font-normal group whitespace-nowrap"
                        >
                          <span className="bg-stone-100/50 p-2.5 rounded-lg group-hover:bg-stone-200/50 transition-colors duration-300">
                            <Info className="h-5 w-5 text-stone-600 group-hover:text-stone-800 transition-colors" />
                          </span>
                          <span className="group-hover:translate-x-1 transition-transform duration-300">
                            Our Story
                          </span>
                        </Link>
                      </motion.div>
                    </div>
                  </div>

                  {/* Venue Links */}
                  <div>
                    <div className="space-y-6 min-w-[200px]">
                      <motion.div
                        custom={3}
                        variants={menuItemVariants}
                        initial="hidden"
                        animate={isNavOpen ? "visible" : "hidden"}
                        whileHover={{
                          scale: 1.05,
                          x: 10,
                          transition: { type: "spring", stiffness: 400 },
                        }}
                      >
                        <Link
                          href={localizeHref(pathname, "/events")}
                          className="flex items-center gap-4 text-stone-700 hover:text-stone-900 transition-all duration-300 text-base font-normal group whitespace-nowrap"
                        >
                          <span className="bg-stone-100/50 p-2.5 rounded-lg group-hover:bg-stone-200/50 transition-colors duration-300">
                            <Calendar className="h-5 w-5 text-stone-600 group-hover:text-stone-800 transition-colors" />
                          </span>
                          <span className="group-hover:translate-x-1 transition-transform duration-300">
                            See Events
                          </span>
                        </Link>
                      </motion.div>
                      <motion.div
                        custom={4}
                        variants={menuItemVariants}
                        initial="hidden"
                        animate={isNavOpen ? "visible" : "hidden"}
                        whileHover={{
                          scale: 1.05,
                          x: 10,
                          transition: { type: "spring", stiffness: 400 },
                        }}
                      >
                        <Link
                          href={localizeHref(pathname, "/whitelotus")}
                          className="flex items-center gap-4 text-stone-700 hover:text-stone-900 transition-all duration-300 text-base font-normal group whitespace-nowrap"
                        >
                          <span className="bg-stone-100/50 p-2.5 rounded-lg group-hover:bg-stone-200/50 transition-colors duration-300">
                            <Info className="h-5 w-5 text-stone-600 group-hover:text-stone-800 transition-colors" />
                          </span>
                          <span className="group-hover:translate-x-1 transition-transform duration-300">
                            About Venue
                          </span>
                        </Link>
                      </motion.div>
                      <motion.div
                        custom={5}
                        variants={menuItemVariants}
                        initial="hidden"
                        animate={isNavOpen ? "visible" : "hidden"}
                        whileHover={{
                          scale: 1.05,
                          x: 10,
                          transition: { type: "spring", stiffness: 400 },
                        }}
                      >
                        <Link
                          href={localizeHref(pathname, "/whitelotus/rent")}
                          className="flex items-center gap-4 text-stone-700 hover:text-stone-900 transition-all duration-300 text-base font-normal group whitespace-nowrap"
                        >
                          <span className="bg-stone-100/50 p-2.5 rounded-lg group-hover:bg-stone-200/50 transition-colors duration-300">
                            <MessageSquare className="h-5 w-5 text-stone-600 group-hover:text-stone-800 transition-colors" />
                          </span>
                          <span className="group-hover:translate-x-1 transition-transform duration-300">
                            Host Your Event
                          </span>
                        </Link>
                      </motion.div>
                    </div>
                  </div>

                  {/* Divider and Contact Link */}
                  <div className="col-span-2 py-3 border-t">
                    <div className=" bg-stone-200/20 "></div>
                    <motion.div
                      custom={5.5}
                      variants={menuItemVariants}
                      initial="hidden"
                      animate={isNavOpen ? "visible" : "hidden"}
                      whileHover={{
                        scale: 1.05,
                        x: 10,
                        transition: { type: "spring", stiffness: 400 },
                      }}
                    >
                      <Link
                        href={localizeHref(pathname, "/shop")}
                        className="flex items-center gap-4 text-stone-700 hover:text-stone-900 transition-all duration-300 text-base font-normal group whitespace-nowrap justify-center"
                      >
                        <span className="bg-stone-100/50 p-2.5 rounded-lg group-hover:bg-stone-200/50 transition-colors duration-300">
                          <ShoppingBag className="h-5 w-5 text-stone-600 group-hover:text-stone-800 transition-colors" />
                        </span>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          Shop
                        </span>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Auth & Cart - Positioned on the right side */}
      <motion.div
        className="hidden lg:flex fixed top-4 right-4 items-center gap-3 z-50 pointer-events-auto"
        animate={{
          scale: isScrolled ? 0.9 : 1,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        {/* Language Toggle */}
        <LanguageToggle className="border border-black bg-white/40 backdrop-blur-md shadow hover:shadow-md text-black" />

        {/* Cart Icon */}
        <motion.div whileTap={{ scale: 0.95 }}>
          <CartIcon hasItems={cartItemCount > 0} count={cartItemCount} />
        </motion.div>

        {/* Profile Icon */}
        <ProfileIcon />
      </motion.div>
    </>
  );
}
