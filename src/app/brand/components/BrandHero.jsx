"use client";
import { motion } from "framer-motion";

export default function BrandHero() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 pb-16">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold text-gray-800 mb-6 tracking-wide"
          >
            Brand Resources
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl font-light text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Download official logos, brand guidelines, and marketing materials
            for Mama Restaurant & White Lotus
          </motion.p>
        </div>
      </div>
    </div>
  );
}
