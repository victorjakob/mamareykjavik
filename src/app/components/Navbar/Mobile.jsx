"use client";

import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import CartIcon from "@/app/components/ui/CartIcon";
import { useCart } from "@/providers/CartProvider";
import {
  Home,
  Utensils,
  Calendar,
  Star,
  Info,
  ShoppingBag,
  X,
} from "lucide-react";

export default function Mobile() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentPath = usePathname();
  const { data: session } = useSession();
  const { cartItemCount } = useCart();

  // Navigation config
  const navSections = [
    {
      title: "Restaurant",
      items: [
        { label: "Home", href: "/restaurant", icon: Home },
        { label: "Menu", href: "/restaurant/menu", icon: Utensils },
        { label: "Book Table", href: "/restaurant/book-table", icon: Calendar },
      ],
    },
    {
      title: "White Lotus",
      items: [
        { label: "Events", href: "/events", icon: Star },
        { label: "Venue", href: "/whitelotus", icon: Info },
      ],
    },
    {
      title: "Shop",
      items: [{ label: "Shop", href: "/shop", icon: ShoppingBag }],
    },
  ];

  return (
    <>
      {/* Mobile Menu Button and Cart Icon */}
      <div className="lg:hidden absolute top-4 right-4 flex items-center gap-2 pointer-events-auto z-[101]">
        <CartIcon hasItems={cartItemCount > 0} count={cartItemCount} />
        <MotionConfig transition={{ duration: 0.6, ease: "easeInOut" }}>
          <motion.button
            initial={false}
            animate={isMenuOpen ? "open" : "closed"}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative h-12 w-12 rounded-full bg-white/10  hover:bg-white/20 transition-colors flex items-center justify-center"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
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
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] bg-gradient-to-br from-white/80 to-emerald-50/80 backdrop-blur-xl flex flex-col pointer-events-auto"
            style={{ willChange: "clip-path, opacity" }}
          >
            {/* Elegant Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
              className="absolute top-5 right-5 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/90 hover:bg-emerald-100 shadow-lg border border-emerald-100 transition-colors group"
              style={{ boxShadow: "0 4px 24px 0 rgba(16,185,129,0.10)" }}
            >
              <X className="h-7 w-7 text-emerald-700 group-hover:text-emerald-900 transition-colors" />
            </motion.button>
            {/* User Profile (optional) */}
            <div className="mt-8 mb-6 flex flex-col items-center justify-center">
              {session ? (
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-emerald-100/70 hover:bg-emerald-200/80 transition-all shadow-lg mb-2 group"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-emerald-700 group-hover:text-emerald-900 transition-colors"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <span className="text-emerald-900 font-semibold text-base group-hover:text-emerald-800 transition-colors text-center truncate w-16">
                    {(() => {
                      if (session.user.name)
                        return session.user.name.split(" ")[0];
                      if (session.user.email)
                        return session.user.email.split("@")[0];
                      return "Profile";
                    })()}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400/80 to-teal-400/80 text-white font-semibold shadow-lg hover:from-emerald-500 hover:to-teal-500 transition-all mb-2 group"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/30 mb-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white group-hover:text-emerald-100 transition-colors"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <span className="text-white font-semibold text-base group-hover:text-emerald-100 transition-colors text-center truncate w-16">
                    Login
                  </span>
                </Link>
              )}
            </div>

            {/* Navigation Sections */}
            <div className="flex-1 flex flex-col justify-center items-center gap-10 px-4 pointer-events-auto">
              {navSections.map((section) => (
                <div
                  key={section.title}
                  className="w-full max-w-xs pointer-events-auto"
                >
                  <div className="mb-3 text-xs font-semibold text-gray-900 uppercase tracking-wider text-center">
                    {section.title}
                  </div>
                  <div className="flex flex-row justify-center gap-4 pointer-events-auto">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`group flex flex-col items-center justify-center px-4 py-3 rounded-2xl bg-white/80 shadow-md hover:bg-emerald-100/80 transition-all duration-200 min-w-[80px] ${
                          currentPath === item.href
                            ? "ring-2 ring-emerald-400"
                            : ""
                        }`}
                      >
                        <item.icon
                          className={`h-7 w-7 mb-1 transition-colors ${
                            item.label === "Events"
                              ? "text-yellow-500 group-hover:text-yellow-600"
                              : "text-emerald-700 group-hover:text-emerald-900"
                          }`}
                        />
                        <span className="text-sm font-medium text-emerald-900 group-hover:text-emerald-800">
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
