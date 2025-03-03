"use client";

import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function Mobile({
  isMenuOpen,
  setIsMenuOpen,
  user,
  profile,
  menuRef,
}) {
  const currentPath = usePathname();

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden absolute top-4 right-4 pointer-events-auto z-[101]">
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
                {user ? (
                  <div className="space-y-2">
                    <div className="flex justify-center mb-2 -mt-10">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-emerald-800"
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
                    <div className="text-emerald-900 font-medium">
                      {profile?.name || user.email}
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="inline-flex items-center px-4 py-1 bg-white border text-emerald-800 rounded-full hover:bg-emerald-700 transition-colors"
                    >
                      <span>My Page</span>
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    className="inline-flex items-center px-6 py-3 bg-emerald-800 text-white rounded-full hover:bg-emerald-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-2">Sign In</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                )}
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
                    More
                  </h3>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/about"
                        className={`block px-4 py-2 text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors ${
                          currentPath === "/about" ? "bg-emerald-50" : ""
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact"
                        className={`block px-4 py-2 text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors ${
                          currentPath === "/contact" ? "bg-emerald-50" : ""
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Contact
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
