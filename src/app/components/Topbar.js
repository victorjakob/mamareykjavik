"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/events" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Contact", href: "/contact" },
];

export default function Topbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-opacity-0 pointer-events-none">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-start">
          {/* Left Logo */}
          <div className="mt-2 lg:mt-4 lg:ml-4">
            <div className="rounded-full">
              <Image
                src="/mamalogo.png"
                alt="Left Logo"
                width={150} // Increase size
                height={150} // Increase size
                className="pt-1 rounded-full w-24 h-24 lg:w-36 lg:h-36" // Adjust Tailwind classes for scaling
              />
            </div>
          </div>
        </div>

        {/* Navigation items for desktop */}
        <div className="hidden md:block absolute top-11 left-1/2 transform -translate-x-1/2">
          <ul className="flex space-x-4 bg-transparent py-2 px-4 rounded-b-lg font-size">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="text-black hover:text-gray-600 px-3 py-2 rounded-md text-base transition-colors duration-200 shadow-sm shadow-black pointer-events-auto"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden absolute top-4 right-1 transform -translate-x-1/2 pointer-events-auto">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-color-white hover:text-gray-600 focus:outline-none focus:text-gray-600"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
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
                <X size={24} />
              </button>
              <ul className="mt-8 space-y-2">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="block text-gray-800 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium pointer-events-auto"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
