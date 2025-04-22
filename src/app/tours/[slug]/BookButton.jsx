"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function BookButton({ tourPath }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Link
        href={`/tours/${tourPath}/booking`}
        className="relative inline-block"
      >
        <motion.span
          className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-[#ff914d] text-white text-base sm:text-lg rounded-full shadow-lg"
          whileHover={{
            scale: 1.03,
            boxShadow: "0 10px 20px rgba(255, 145, 77, 0.2)",
          }}
          whileTap={{ scale: 0.98 }}
          transition={{
            duration: 0.2,
            boxShadow: { duration: 0.3 },
          }}
        >
          <span className="flex items-center gap-2">
            Book This Tour
            <motion.span
              initial={{ x: 0 }}
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
              className="hidden sm:inline-block"
            >
              →
            </motion.span>
          </span>
        </motion.span>
      </Link>
    </motion.div>
  );
}
