"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileIcon({ href = "/profile", className = "" }) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    // Reset after animation completes
    setTimeout(() => setIsClicked(false), 800);
  };

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        href={href}
        onClick={handleClick}
        className={`relative group h-11 w-11 flex items-center justify-center rounded-full border border-black bg-white/40 backdrop-blur-md shadow hover:shadow-md transition-all duration-300 overflow-hidden ${className}`}
        aria-label="View profile"
      >
        {/* Gentle ripple effect on click */}
        <AnimatePresence>
          {isClicked && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 bg-orange-400/25 rounded-full"
            />
          )}
        </AnimatePresence>

        {/* Icon with subtle animation */}
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-black group-hover:text-gray-700 transition-colors duration-300 relative z-10"
          fill="currentColor"
          viewBox="0 0 20 20"
          animate={
            isClicked
              ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 2, -2, 0],
                }
              : {}
          }
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </motion.svg>

        {/* Subtle glow effect */}
        <AnimatePresence>
          {isClicked && (
            <motion.div
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: [0, 0.6, 0], scale: [1, 1.08, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border border-orange-400/50 shadow-md shadow-orange-400/25"
            />
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
}
