"use client";

import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import CartIcon from "@/app/components/ui/CartIcon";
import { useCart } from "@/providers/CartProvider";

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
      left: "calc(50% + 5px)",
    },
  },
};

export default function Mobile() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const currentPath = usePathname();
  const { data: session } = useSession();
  const { cartItemCount } = useCart();

  return (
    <>
      {/* Mobile Menu Button and Cart Icon */}
      <div className="lg:hidden absolute top-4 right-4 flex items-center gap-2 pointer-events-auto z-[101]">
        <CartIcon hasItems={cartItemCount > 0} count={cartItemCount} />
        <MotionConfig
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
        >
          <motion.button
            initial={false}
            animate={isMenuOpen ? "open" : "closed"}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative h-10 w-10 rounded-full bg-white/10 backdrop-blur-lg hover:bg-white/20 transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <motion.span
              variants={VARIANTS.top}
              className="absolute h-0.5 w-5 bg-emerald-800"
              style={{ y: "-50%", left: "50%", x: "-50%", top: "35%" }}
            />
            <motion.span
              variants={VARIANTS.middle}
              className="absolute h-0.5 w-5 bg-emerald-800"
              style={{ left: "50%", x: "-50%", top: "50%", y: "-50%" }}
            />
            <motion.span
              variants={VARIANTS.bottom}
              className="absolute h-0.5 w-2.5 bg-emerald-800"
              style={{
                x: "-50%",
                y: "50%",
                bottom: "35%",
                left: "calc(50% + 5px)",
              }}
            />
          </motion.button>
        </MotionConfig>
      </div>

      {/* Mobile Sidenav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ transform: "translateX(100%)" }}
            animate={{ transform: "translateX(0)" }}
            exit={{ transform: "translateX(100%)" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-white to-gray-50 pointer-events-auto z-[100] lg:hidden overflow-y-auto"
          >
            <div className="p-6">
              {/* User Profile Section */}
              <div className="mt-8 mb-6 text-center">
                <div className="space-y-2">
                  {session ? (
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="group relative flex flex-col items-center p-2 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 rounded-xl transition-all duration-300 border border-gray-200/60 shadow-lg shadow-emerald-100/20 hover:shadow-emerald-200/40 hover:border-emerald-200/80 backdrop-blur-sm"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 p-[2px] shadow-lg">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-emerald-600 group-hover:text-emerald-700 transition-colors"
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
                        </div>
                      </div>
                      <div className="mt-3 text-emerald-900 font-medium group-hover:text-emerald-700 transition-colors">
                        {session.user.name || session.user.email}
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  ) : (
                    <Link
                      href="/auth"
                      onClick={() => setIsMenuOpen(false)}
                      className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/50 hover:scale-[1.02]"
                    >
                      <span>Login/Register</span>
                    </Link>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Navigation Sections */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Restaurant
                  </h3>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/restaurant"
                        className={`block px-4 py-2 text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors ${
                          currentPath === "/restaurant" ? "bg-emerald-50" : ""
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/restaurant/menu"
                        className={`block px-4 py-2 text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors ${
                          currentPath === "/restaurant/menu"
                            ? "bg-emerald-50"
                            : ""
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Menu
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/restaurant/book-table"
                        className={`block px-4 py-2 text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors ${
                          currentPath === "/restaurant/book-table"
                            ? "bg-emerald-50"
                            : ""
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Book Table
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    White Lotus
                  </h3>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/events"
                        className={`block px-4 py-2 text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors ${
                          currentPath === "/events" ? "bg-emerald-50" : ""
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Events
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/whitelotus"
                        className={`block px-4 py-2 text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors ${
                          currentPath === "/whitelotus" ? "bg-emerald-50" : ""
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        About Venue
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Shop
                  </h3>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/shop"
                        className={`block px-4 py-2 text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors ${
                          currentPath === "/shop" ? "bg-emerald-50" : ""
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Shop
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
