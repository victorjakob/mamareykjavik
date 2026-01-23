"use client";

import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import CartIcon from "@/app/components/ui/CartIcon";
import { useCart } from "@/providers/CartProvider";
import LanguageToggle from "@/app/components/LanguageToggle";
import {
  Home,
  Utensils,
  Calendar,
  Star,
  Info,
  ShoppingBag,
  X,
} from "lucide-react";
import { localizeHref } from "@/lib/i18n-routing";

export default function Mobile() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const currentPath = usePathname();
  const { data: session } = useSession();
  const { cartItemCount } = useCart();

  // Reset auth options when menu closes
  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setShowAuthOptions(false);
  };

  // Navigation config
  const navSections = [
    {
      title: "Restaurant",
      items: [
        { label: "Home", href: localizeHref(currentPath, "/restaurant"), icon: Home },
        { label: "Menu", href: localizeHref(currentPath, "/restaurant/menu"), icon: Utensils },
        { label: "Book Table", href: localizeHref(currentPath, "/restaurant/book-table"), icon: Calendar },
      ],
    },
    {
      title: "White Lotus",
      items: [
        { label: "Venue", href: localizeHref(currentPath, "/whitelotus"), icon: Info },
        { label: "Events", href: localizeHref(currentPath, "/events"), icon: Star },
      ],
    },
    {
      title: "Shop",
      items: [{ label: "Shop", href: localizeHref(currentPath, "/shop"), icon: ShoppingBag }],
    },
  ];

  return (
    <>
      {/* Mobile Menu Button and Cart Icon */}
      <div className="lg:hidden absolute top-4 right-4 flex items-center gap-3 pointer-events-auto z-[101]">
        <CartIcon hasItems={cartItemCount > 0} count={cartItemCount} />
        <MotionConfig
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.button
            initial={false}
            animate={isMenuOpen ? "open" : "closed"}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center border border-white/20"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Minimalist Elegant Rainbow Hamburger Icon */}
            <motion.svg
              width={44}
              height={44}
              viewBox="1 5 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="block"
              style={{ transform: isMenuOpen ? undefined : "rotate(-140deg)" }}
            >
              {/* Top Arc - custom emerald color */}
              <motion.path
                d="M10 22 Q20 8 30 22"
                stroke="hsl(var(--color-primary-green))"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                variants={{
                  closed: { opacity: 1, pathLength: 1, scale: 1, y: 0 },
                  open: { opacity: 0, pathLength: 0, scale: 0.8, y: -8 },
                }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
              />
              {/* Middle Arc */}
              <motion.path
                d="M12 27 Q20 15 28 27"
                stroke="hsl(var(--color-primary-green))"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                variants={{
                  closed: { opacity: 1, pathLength: 1, scale: 1, y: 0 },
                  open: { opacity: 0, pathLength: 0, scale: 0.9, y: 0 },
                }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
              />
              {/* Bottom Arc */}
              <motion.path
                d="M14 32 Q20 24 26 32"
                stroke="hsl(var(--color-primary-green))"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                variants={{
                  closed: { opacity: 1, pathLength: 1, scale: 1, y: 0 },
                  open: { opacity: 0, pathLength: 0, scale: 1, y: 8 },
                }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
              />
              {/* X icon for close, always upright */}
              <motion.g
                variants={{
                  closed: { rotate: -120 },
                  open: { rotate: 0 },
                }}
                style={{ transformOrigin: "50% 50%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <motion.line
                  x1="15"
                  y1="15"
                  x2="25"
                  y2="25"
                  stroke="hsl(var(--color-primary-green))"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  variants={{
                    closed: { opacity: 0, scale: 0.7 },
                    open: { opacity: 1, scale: 1 },
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <motion.line
                  x1="25"
                  y1="15"
                  x2="15"
                  y2="25"
                  stroke="hsl(var(--color-primary-green))"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  variants={{
                    closed: { opacity: 0, scale: 0.7 },
                    open: { opacity: 1, scale: 1 },
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </motion.g>
            </motion.svg>
          </motion.button>
        </MotionConfig>
      </div>
      {/* Contact Chatbox Floating Button */}
      {/* Fullscreen Overlay Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{
              opacity: 0,
              clipPath: "circle(0% at 95% 5%)",
            }}
            animate={{
              opacity: 1,
              clipPath: "circle(140% at 95% 5%)",
            }}
            exit={{
              opacity: 0,
              clipPath: "circle(0% at 95% 5%)",
            }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-[200] bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md flex flex-col pointer-events-auto"
            style={{ willChange: "clip-path, opacity" }}
          >
            {/* Top Left - Language Toggle */}
            <div className="absolute top-5 left-5 z-20">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <LanguageToggle />
              </motion.div>
            </div>

            {/* Top Right Controls */}
            <div className="absolute top-5 right-5 z-20 flex flex-col items-end gap-3">
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                onClick={handleMenuClose}
                aria-label="Close menu"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/95 hover:bg-white shadow-xl border border-white/30 transition-all duration-200 group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X
                  className="h-5 w-5 text-slate-700 group-hover:text-emerald-600 transition-colors"
                  strokeWidth={2.5}
                />
              </motion.button>

              {/* Profile Icon / Auth Options */}
              <AnimatePresence mode="wait">
                {!session && showAuthOptions ? (
                  // Two auth options (Login & Register)
                  <motion.div
                    key="auth-options"
                    className="flex flex-row gap-3 items-center"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 15,
                        delay: 0,
                      }}
                    >
                      <Link
                        href="/auth?mode=login"
                        onClick={handleMenuClose}
                        className="group"
                      >
                        <span className="text-sm font-light text-white/90 hover:text-white transition-colors">
                          Login
                        </span>
                      </Link>
                    </motion.div>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, delay: 0.05 }}
                      className="text-white/40"
                    >
                      |
                    </motion.span>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 15,
                        delay: 0.1,
                      }}
                    >
                      <Link
                        href="/auth?mode=signup"
                        onClick={handleMenuClose}
                        className="group"
                      >
                        <span className="text-sm font-medium text-emerald-200 hover:text-emerald-100 transition-colors">
                          Register
                        </span>
                      </Link>
                    </motion.div>
                  </motion.div>
                ) : (
                  // Single Profile Icon
                  <motion.div
                    key="profile-icon"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      duration: 0.3,
                      delay: session ? 0.1 : 0,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {session ? (
                      <Link
                        href="/profile"
                        onClick={handleMenuClose}
                        className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 shadow-lg hover:shadow-xl border-2 border-white/30 hover:border-white/50 transition-all duration-300 group"
                        aria-label="Go to profile"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </Link>
                    ) : (
                      <button
                        onClick={() => setShowAuthOptions(true)}
                        className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 shadow-lg hover:shadow-xl border-2 border-white/30 hover:border-white/50 transition-all duration-300 group"
                        aria-label="Login options"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Welcome Message - Only for logged in users */}
            {session && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="absolute top-20 left-0 right-0 text-center pointer-events-none"
              >
                <p className="text-white/90 font-light text-lg">
                  Welcome,{" "}
                  <span className="font-medium text-emerald-200">
                    {session.user.name?.split(" ")[0] ||
                      session.user.email?.split("@")[0] ||
                      "Guest"}
                  </span>
                </p>
              </motion.div>
            )}

            {/* Navigation Sections */}
            <div className="flex-1 flex flex-col justify-center items-center gap-10 px-6 py-8 pointer-events-auto overflow-y-auto">
              {navSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.2 + sectionIndex * 0.1,
                  }}
                  className="w-full max-w-sm pointer-events-auto"
                >
                  <div className="mb-3 text-[10px] font-light font-aegean text-white/80 tracking-[0.2em] uppercase text-center">
                    {section.title}
                  </div>
                  <div className="flex flex-row justify-center gap-2.5 pointer-events-auto flex-wrap">
                    {section.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.3 + sectionIndex * 0.1 + itemIndex * 0.05,
                        }}
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Link
                          href={item.href}
                          onClick={handleMenuClose}
                          className={`group relative flex flex-col items-center justify-center px-4 py-3 rounded-xl backdrop-blur-sm transition-all duration-300 min-w-[75px] ${
                            currentPath === item.href
                              ? "bg-white/85 shadow-md ring-1 ring-emerald-400/50"
                              : "bg-white/75 hover:bg-white/85 shadow-sm hover:shadow-md border border-white/20"
                          }`}
                        >
                          <item.icon
                            className={`h-5 w-5 mb-1.5 transition-all duration-300 ${
                              item.label === "Events"
                                ? "text-yellow-500 group-hover:text-yellow-600"
                                : "text-emerald-600 group-hover:text-emerald-700"
                            }`}
                            strokeWidth={2}
                          />
                          <span className="text-xs font-medium transition-colors text-slate-700 group-hover:text-slate-900">
                            {item.label}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
