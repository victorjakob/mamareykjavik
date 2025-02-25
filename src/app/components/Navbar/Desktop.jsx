"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSupabase } from "@/lib/SupabaseProvider";
import Cookies from "js-cookie";

export default function Desktop({ user, profile }) {
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);
  const restaurantRef = useRef(null);
  const currentPath = usePathname();
  const { cartCount } = useSupabase();

  // Handle clicks outside dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        restaurantRef.current &&
        !restaurantRef.current.contains(event.target)
      ) {
        setIsRestaurantOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Desktop Auth */}
      <div className="hidden lg:flex pointer-events-auto absolute top-7 right-4 items-center gap-3">
        {/* Cart Icon */}
        {(user || Cookies.get("guest_id")) && (
          <motion.div
            whileTap={{ scale: 0.9, rotate: -10 }}
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Link
              href="/shop/cart"
              className="relative flex items-center justify-center h-10 w-10 text-white bg-[#362108b0] rounded-full hover:bg-[#152407] transition-all duration-300 group"
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transform group-hover:scale-110 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </motion.svg>
              {cartCount > 0 && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full shadow-lg backdrop-blur-sm"
                >
                  {cartCount}
                </motion.div>
              )}
              <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </Link>
          </motion.div>
        )}

        {/* Auth Button */}
        {user ? (
          <Link
            href="/profile"
            className="flex items-center gap-2 text-white bg-[#362108b0] px-4 py-2 rounded-full hover:bg-[#152407] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <span>My Page</span>
          </Link>
        ) : (
          <Link
            href="/auth"
            className="flex items-center gap-2 text-white bg-[#362108b0] px-4 py-2 rounded-full hover:bg-[#152407] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <span>Sign in/up</span>
          </Link>
        )}
      </div>

      {/* Navigation Items */}
      <div className="pointer-events-auto hidden lg:block absolute top-7 left-1/2 transform -translate-x-1/2">
        <nav className="px-1 py-1 rounded-full shadow-lg backdrop-blur-3xl bg-[#362108]/70">
          <ul className="flex items-center space-x-2">
            {/* Restaurant Dropdown */}
            <li className="relative" ref={restaurantRef}>
              <button
                onClick={() => {
                  setIsRestaurantOpen(!isRestaurantOpen);
                }}
                className={`flex items-center px-4 py-2 rounded-full text-base transition-colors relative overflow-hidden ${
                  isRestaurantOpen ||
                  currentPath === "/" ||
                  currentPath === "/restaurant/menu" ||
                  currentPath === "/restaurant/book-table" ||
                  currentPath === "/about"
                    ? "bg-white/30 text-white"
                    : "text-slate-50 hover:bg-white/30"
                }`}
              >
                <span className="relative z-10">Restaurant</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ml-2 transition-transform duration-200 relative z-10 ${
                    isRestaurantOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isRestaurantOpen && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 bg-[#362108]/90 backdrop-blur-lg shadow-xl rounded-xl py-2 w-44"
                  >
                    <ul className="space-y-1">
                      <li>
                        <Link
                          href="/"
                          onClick={() => setIsRestaurantOpen(false)}
                          className="block px-4 py-2 text-slate-50 relative overflow-hidden group"
                        >
                          <span className="relative z-10">Home</span>
                          <div className="absolute inset-0 bg-white/30 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/restaurant/menu"
                          onClick={() => setIsRestaurantOpen(false)}
                          className="block px-4 py-2 text-slate-50 relative overflow-hidden group"
                        >
                          <span className="relative z-10">Menu</span>
                          <div className="absolute inset-0 bg-white/30 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/restaurant/book-table"
                          onClick={() => setIsRestaurantOpen(false)}
                          className="block px-4 py-2 text-slate-50 relative overflow-hidden group"
                        >
                          <span className="relative z-10">Book Table</span>
                          <div className="absolute inset-0 bg-white/30 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/about"
                          onClick={() => setIsRestaurantOpen(false)}
                          className="block px-4 py-2 text-slate-50 relative overflow-hidden group"
                        >
                          <span className="relative z-10">Our Story</span>
                          <div className="absolute inset-0 bg-white/30 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </Link>
                      </li>
                    </ul>
                  </motion.div>
                </AnimatePresence>
              )}
            </li>

            {/* Events */}
            <li>
              <Link
                href="/events"
                className={`px-4 py-2 rounded-full text-base transition-colors relative overflow-hidden ${
                  currentPath === "/events"
                    ? "bg-white/30 text-white"
                    : "text-slate-50 hover:bg-white/30"
                }`}
              >
                <span className="relative z-10">Events</span>
              </Link>
            </li>

            {/* Contact Us */}
            <li>
              <Link
                href="/contact"
                className={`px-4 py-2 rounded-full text-base transition-colors text-center ${
                  currentPath === "/contact"
                    ? "bg-white/30 text-white"
                    : "text-slate-50 hover:bg-white/30"
                }`}
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
