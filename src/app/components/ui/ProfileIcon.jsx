"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

export default function ProfileIcon({ href = "/profile", className = "" }) {
  const [isClicked, setIsClicked] = useState(false);
  const { data: session } = useSession();

  // Redirect to login if not authenticated, otherwise go to profile
  const destination = session ? "/profile" : "/auth?mode=login";

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
        href={destination}
        onClick={handleClick}
        className={`relative group h-11 w-11 flex items-center justify-center rounded-full border border-black bg-white/40 backdrop-blur-md shadow hover:shadow-md transition-all duration-300 overflow-visible ${className}`}
        aria-label={session ? "View profile" : "Sign in"}
      >
        {/* Fun loading spinner - animated circles */}
        <AnimatePresence>
          {isClicked && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Spinning circles */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-11 h-11 border-2 border-orange-400 rounded-full"
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    rotate: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.2,
                    },
                    scale: {
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2,
                    },
                    opacity: {
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2,
                    },
                  }}
                  style={{
                    borderRadius: "50%",
                    borderTopColor: i === 0 ? "#fb923c" : "transparent",
                    borderRightColor: i === 1 ? "#fb923c" : "transparent",
                    borderBottomColor: i === 2 ? "#fb923c" : "transparent",
                    borderLeftColor: "transparent",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

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
                  opacity: [1, 0.5, 1],
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
