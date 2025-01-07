"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const links = [
  { name: "Menu", href: "./menu" },
  { name: "Book Table", href: "./book-table" },
  { name: "Our Story", href: "./our-story" },
];

const bounceVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.2, // Stagger the animation based on the index
      duration: 0.6,
      type: "spring",
      stiffness: 150,
    },
  }),
};

export default function MenuRestaurant() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full pt-40 space-y-10">
      {links.map((link, index) => (
        <motion.div
          key={link.name}
          custom={index} // Pass index to stagger animations
          variants={bounceVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-xs" // Ensure consistent button width
        >
          <Link
            href={link.href}
            className="block text-center text-xl font-semibold text-gray-800 hover:text-gray-600 px-6 py-3 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out"
          >
            {link.name}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
