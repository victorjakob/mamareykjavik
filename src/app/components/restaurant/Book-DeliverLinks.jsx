"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function BookDeliverLinks() {
  return (
    <div className="max-w-3xl mx-auto px-4 pb-12 flex flex-col items-center">
      <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          <Link
            href="https://www.dineout.is/mamareykjavik?g=2&dt=2025-02-03T13:30&area=anywhere&cats=&type=bookings&isolation=true"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 border border-orange-600 text-orange-600 rounded-full font-light tracking-wide hover:tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 ease-in-out"
          >
            Book a Table
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          <Link
            href="https://wolt.com/en/isl/reykjavik/restaurant/mama-reykjavik"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-7 py-3 border border-orange-600 text-orange-600 rounded-full font-light tracking-wide hover:tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 ease-in-out"
          >
            Order Takeaway
          </Link>
        </motion.div>
      </div>
      <p className="text-gray-600 font-semibold text-lg mt-8">
        Looking forward to seeing you at Mama!
      </p>
    </div>
  );
}
