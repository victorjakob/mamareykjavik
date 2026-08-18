"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function BookButton({ tourPath, label = "Book this journey" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="inline-block"
    >
      <Link
        href={`/tours/${tourPath}/booking`}
        className="inline-block px-9 py-3.5 bg-[#ff914d] text-black font-semibold rounded-full text-xs sm:text-sm tracking-wide hover:scale-[1.04] hover:bg-[#ff914d]/90 transition-all duration-200 shadow-[0_2px_20px_rgba(255,145,77,0.3)]"
      >
        {label}
      </Link>
    </motion.div>
  );
}
