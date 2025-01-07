"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Topbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile menu state
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(false); // Dropdown for Restaurant
  const [isVenueOpen, setIsVenueOpen] = useState(false); // Dropdown for Venue

  // Refs for dropdowns to detect outside clicks
  const restaurantRef = useRef(null);
  const venueRef = useRef(null);
  const menuRef = useRef(null); // Ref for the entire mobile menu

  // Access current route
  const currentPath = usePathname();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        restaurantRef.current &&
        !restaurantRef.current.contains(event.target)
      ) {
        setIsRestaurantOpen(false);
      }
      if (venueRef.current && !venueRef.current.contains(event.target)) {
        setIsVenueOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false); // Close mobile menu if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-opacity-0 pointer-events-none">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-start">
          {/* Logo */}
          <div
            className="relative w-32 sm:w-32 md:w-36 lg:w-40 xl:w-48"
            style={{ aspectRatio: "724 / 787" }}
          >
            <Image
              src="/mamaimg/mamalogo.png"
              alt="Logo"
              priority
              fill
              sizes="(max-width: 640px) 192px"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Navigation Items */}
        <div
          className="pointer-events-auto hidden md:block absolute top-7 left-1/2
         transform -translate-x-1/2 shadow-lg 
         rounded-full backdrop-blur-3xl bg-[#362108b0] opacity-70
         "
        >
          <ul className="flex space-x-4 bg-transparent py-2 px-1 rounded-b-lg font-size">
            {/* Home */}
            <li className="flex items-center">
              <Link
                href="/"
                className={`px-3 py-1 rounded-full text-base ${
                  currentPath === "/"
                    ? "bg-[#152407] text-white"
                    : "bg-transparent text-slate-50"
                } hover:bg-[#152407] transition duration-200`}
              >
                Home
              </Link>
            </li>

            {/* Restaurant with Dropdown */}
            <li className="flex items-center relative" ref={restaurantRef}>
              <button
                onClick={() => {
                  setIsRestaurantOpen(!isRestaurantOpen);
                  setIsVenueOpen(false); // Ensure Venue dropdown closes
                }}
                className="flex items-center px-3 py-1 rounded-full text-base bg-transparent text-slate-50 hover:bg-[#152407] transition duration-200"
              >
                <span>Restaurant</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ml-2 transform transition-transform duration-200 ${
                    isRestaurantOpen ? "rotate-180" : "rotate-0"
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
                {isRestaurantOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1 mt-2  bg-[#362108b0] shadow-lg rounded-lg py-2 w-40"
                  >
                    <ul className="space-y-1">
                      <li>
                        <Link
                          href="/restaurant/menu"
                          className="block px-4 py-2 text-slate-50 hover:bg-[#152407] rounded-full"
                        >
                          Menu
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/restaurant/book-table"
                          className="block px-4 py-2 text-slate-50 hover:bg-[#152407] rounded-full"
                        >
                          Book Table
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/restaurant/our-story"
                          className="block px-4 py-2 text-slate-50 hover:bg-[#152407] rounded-full"
                        >
                          Our Story
                        </Link>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>

            {/* Events */}
            <li className="flex items-center">
              <Link
                href="/events"
                className={`px-3 py-1 rounded-full text-base ${
                  currentPath === "/events"
                    ? "bg-[#152407] text-white"
                    : "bg-transparent text-slate-50"
                } hover:bg-[#152407] transition duration-200`}
              >
                Events
              </Link>
            </li>

            {/* Shop */}
            <li className="flex items-center">
              <Link
                href="/shop"
                className={`px-3 py-1 rounded-full text-base ${
                  currentPath === "/shop"
                    ? "bg-[#152407] text-white"
                    : "bg-transparent text-slate-50"
                } hover:bg-[#152407] transition duration-200`}
              >
                Shop
              </Link>
            </li>

            {/* Venue with Dropdown */}
            <li className="flex items-center relative" ref={venueRef}>
              <button
                onClick={() => {
                  setIsVenueOpen(!isVenueOpen);
                  setIsRestaurantOpen(false); // Ensure Restaurant dropdown closes
                }}
                className="flex items-center px-3 py-1 rounded-full text-base bg-transparent text-slate-50 hover:bg-[#152407] transition duration-200"
              >
                <span>Venue</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ml-2 transform transition-transform duration-200 ${
                    isVenueOpen ? "rotate-180" : "rotate-0"
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
                {isVenueOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2  bg-[#362108b0] shadow-lg rounded-lg py-2 w-40"
                  >
                    <ul className="space-y-1">
                      <li>
                        <Link
                          href="/events"
                          className="block px-4 py-2 text-slate-50 hover:bg-[#152407] rounded-full"
                        >
                          Events
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/whitelotus"
                          className="block px-4 py-2 text-slate-50 hover:bg-[#152407] rounded-full"
                        >
                          Rent Venue
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/whitelotus"
                          className="block px-4 py-2 text-slate-50 hover:bg-[#152407] rounded-full"
                        >
                          Contact Us
                        </Link>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>
        </div>
        {/* Mobile Menu Button */}
        <div className="md:hidden absolute top-4 right-4 transform -translate-x-1/2 pointer-events-auto">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-slate-50 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X color="green" size={24} />
            ) : (
              <Menu color="green" size={24} />
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
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 md:hidden"
            >
              <div className="p-4">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-800 hover:text-gray-600 focus:outline-none focus:text-gray-600 absolute top-4 right-4"
                  aria-label="Close menu"
                >
                  <X color="green" size={24} />
                </button>
                <ul className="mt-8 space-y-2">
                  {/* Home */}
                  <li>
                    <Link
                      href="/"
                      className={`block text-black px-3 py-2 rounded-md pointer-events-auto ${
                        currentPath === "/"
                          ? "text-gray-900 font-semibold  text-base"
                          : "hover:text-gray-600  text-sm"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                  </li>

                  {/* Restaurant */}
                  <li>
                    <button
                      ref={restaurantRef}
                      onClick={() => setIsRestaurantOpen(!isRestaurantOpen)}
                      className="flex items-center justify-between text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium pointer-events-auto w-full"
                    >
                      <span>Restaurant</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transform transition-transform duration-200 ${
                          isRestaurantOpen ? "rotate-180" : "rotate-0"
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
                      {isRestaurantOpen && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pointer-events-auto ml-4 space-y-2"
                        >
                          <li>
                            <Link
                              href="/restaurant/menu"
                              className="block text-gray-700 hover:text-gray-500 px-3 py-1 rounded-md text-sm font-normal"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              Menu
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/restaurant/book-table"
                              className="block text-gray-700 hover:text-gray-500 px-3 py-1 rounded-md text-sm font-normal"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              Book Table
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/restaurant/our-story"
                              className="block text-gray-700 hover:text-gray-500 px-3 py-1 rounded-md text-sm font-normal"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              Our Story
                            </Link>
                          </li>
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>

                  {/* Events */}
                  <li>
                    <Link
                      href="/events"
                      className={`block px-3 py-2 rounded-md text-sm pointer-events-auto ${
                        currentPath === "/events"
                          ? "text-gray-900 font-semibold text-base"
                          : "hover:text-gray-700 text-sm"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Events
                    </Link>
                  </li>

                  {/* Shop */}
                  <li>
                    <Link
                      href="/shop"
                      className={`block  px-3 py-2 rounded-md text-sm pointer-events-auto ${
                        currentPath === "/shop"
                          ? "text-gray-900 font-semibold text-base"
                          : "hover:text-gray-700 text-sm"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Shop
                    </Link>
                  </li>

                  {/* Venue */}
                  <li>
                    <button
                      ref={venueRef}
                      onClick={() => setIsVenueOpen(!isVenueOpen)}
                      className="flex items-center justify-between text-gray-600 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium pointer-events-auto w-full"
                    >
                      <span>Venue</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transform transition-transform duration-200 ${
                          isVenueOpen ? "rotate-180" : "rotate-0"
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
                      {isVenueOpen && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pointer-events-auto ml-4 space-y-2"
                        >
                          <li>
                            <Link
                              href="/events"
                              className="block text-gray-700 hover:text-gray-500 px-3 py-1 rounded-md text-sm font-normal"
                              onClick={() => {
                                setIsVenueOpen(false);
                                setIsMenuOpen(false);
                              }}
                            >
                              Events
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/whitelotus"
                              className="block text-gray-700 hover:text-gray-500 px-3 py-1 rounded-md text-sm font-normal"
                              onClick={() => {
                                setIsVenueOpen(false);
                                setIsMenuOpen(false);
                              }}
                            >
                              Rent Venue
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/whitelotus"
                              className="block text-gray-700 hover:text-gray-500 px-3 py-1 rounded-md text-sm font-normal"
                              onClick={() => {
                                setIsVenueOpen(false);
                                setIsMenuOpen(false);
                              }}
                            >
                              Contact Us
                            </Link>
                          </li>
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>

                  {/* Contact */}
                  <li>
                    <Link
                      href="/contact"
                      className={`block text-black px-3 py-2 rounded-md text-sm pointer-events-auto ${
                        currentPath === "/contact"
                          ? "text-gray-900 font-semibold text-base"
                          : "hover:text-gray-700 text-sm"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
