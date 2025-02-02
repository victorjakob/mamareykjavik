"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Topbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);
  const [isWhiteLotusOpen, setIsWhiteLotusOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const restaurantRef = useRef(null);
  const whiteLotusRef = useRef(null);
  const menuRef = useRef(null);

  const currentPath = usePathname();

  // Handle clicks outside dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        restaurantRef.current &&
        !restaurantRef.current.contains(event.target)
      ) {
        setIsRestaurantOpen(false);
      }
      if (
        whiteLotusRef.current &&
        !whiteLotusRef.current.contains(event.target)
      ) {
        setIsWhiteLotusOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const getUserAndProfile = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) return console.error("Error fetching user:", error);

      setUser(user);

      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("name, user_id")
          .eq("user_id", user.id)
          .single();

        if (profileError) console.error("Profile fetch error:", profileError);
        setProfile(profileData || null);
      }
    };

    getUserAndProfile();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) getUserAndProfile();
      }
    );

    return () => authListener?.subscription?.unsubscribe();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-opacity-0 pointer-events-none">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-start">
          {/* Logo */}
          <Link href="/" className="pointer-events-auto">
            <div className="relative w-32 sm:w-32 md:w-36 lg:w-40 xl:w-48 aspect-[724/787]">
              <Image
                src="/mamaimg/mamalogo.png"
                alt="Logo"
                priority
                fill
                sizes="(max-width: 640px) 192px"
                style={{ objectFit: "contain" }}
              />
            </div>
          </Link>

          {/* Desktop Auth */}
          <div className="hidden md:block pointer-events-auto absolute top-7 right-4">
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
        </div>

        {/* Navigation Items */}
        <div className="pointer-events-auto hidden md:block absolute top-7 left-1/2 transform -translate-x-1/2">
          <nav className="px-1 py-1 rounded-full shadow-lg backdrop-blur-3xl bg-[#362108]/70">
            <ul className="flex items-center space-x-2">
              {/* Restaurant Dropdown */}
              <li className="relative" ref={restaurantRef}>
                <button
                  onClick={() => {
                    setIsRestaurantOpen(!isRestaurantOpen);
                    setIsWhiteLotusOpen(false);
                  }}
                  className={`flex items-center px-4 py-2 rounded-full text-base transition-colors ${
                    isRestaurantOpen ||
                    currentPath === "/" ||
                    currentPath === "/restaurant/menu" ||
                    currentPath === "/restaurant/book-table" ||
                    currentPath === "/about"
                      ? "bg-[#152407] text-white"
                      : "text-slate-50 hover:bg-[#152407]/80"
                  }`}
                >
                  Restaurant
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ml-2 transition-transform duration-200 ${
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
                            className={`block px-4 py-2 text-slate-50 hover:bg-[#152407] transition-colors ${
                              currentPath === "/" ? "bg-[#152407]" : ""
                            }`}
                          >
                            Home
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/restaurant/menu"
                            onClick={() => setIsRestaurantOpen(false)}
                            className={`block px-4 py-2 text-slate-50 hover:bg-[#152407] transition-colors ${
                              currentPath === "/restaurant/menu"
                                ? "bg-[#152407]"
                                : ""
                            }`}
                          >
                            Menu
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/restaurant/book-table"
                            onClick={() => setIsRestaurantOpen(false)}
                            className={`block px-4 py-2 text-slate-50 hover:bg-[#152407] transition-colors ${
                              currentPath === "/restaurant/book-table"
                                ? "bg-[#152407]"
                                : ""
                            }`}
                          >
                            Book Table
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/about"
                            onClick={() => setIsRestaurantOpen(false)}
                            className={`block px-4 py-2 text-slate-50 hover:bg-[#152407] transition-colors ${
                              currentPath === "/about" ? "bg-[#152407]" : ""
                            }`}
                          >
                            Our Story
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
                  className={`px-4 py-2 rounded-full text-base transition-colors ${
                    currentPath === "/events"
                      ? "bg-[#152407] text-white"
                      : "text-slate-50 hover:bg-[#152407]/80"
                  }`}
                >
                  Events
                </Link>
              </li>

              {/* White Lotus Dropdown */}
              <li className="relative" ref={whiteLotusRef}>
                <button
                  onClick={() => {
                    setIsWhiteLotusOpen(!isWhiteLotusOpen);
                    setIsRestaurantOpen(false);
                  }}
                  className={`flex items-center px-4 py-2 rounded-full text-base transition-colors ${
                    isWhiteLotusOpen || currentPath === "/whitelotus"
                      ? "bg-[#152407] text-white"
                      : "text-slate-50 hover:bg-[#152407]/80"
                  }`}
                >
                  White Lotus
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ml-2 transition-transform duration-200 ${
                      isWhiteLotusOpen ? "rotate-180" : ""
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

                <AnimatePresence>
                  {isWhiteLotusOpen && (
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
                            href="/events"
                            onClick={() => setIsWhiteLotusOpen(false)}
                            className={`block px-4 py-2 text-slate-50 hover:bg-[#152407] transition-colors ${
                              currentPath === "/events" ? "bg-[#152407]" : ""
                            }`}
                          >
                            Events
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/whitelotus"
                            onClick={() => setIsWhiteLotusOpen(false)}
                            className={`block px-4 py-2 text-slate-50 hover:bg-[#152407] transition-colors ${
                              currentPath === "/whitelotus"
                                ? "bg-[#152407]"
                                : ""
                            }`}
                          >
                            About Venue
                          </Link>
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>

              {/* Contact Us */}
              <li>
                <Link
                  href="/contact"
                  className={`px-4 py-2 rounded-full text-base transition-colors ${
                    currentPath === "/contact"
                      ? "bg-[#152407] text-white"
                      : "text-slate-50 hover:bg-[#152407]/80"
                  }`}
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden absolute top-4 right-4 pointer-events-auto">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full bg-white/10 backdrop-blur-lg hover:bg-white/20 transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="text-emerald-800" size={24} />
            ) : (
              <Menu className="text-emerald-800" size={24} />
            )}
          </button>
        </div>

        {/* Mobile Sidenav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              ref={menuRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-white to-gray-50 shadow-2xl pointer-events-auto z-[100] md:hidden overflow-y-auto"
            >
              <div className="p-6">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="text-emerald-800" size={24} />
                </button>

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
                          href="/"
                          className={`block px-4 py-2 text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors ${
                            currentPath === "/" ? "bg-emerald-50" : ""
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
      </div>
    </nav>
  );
}
