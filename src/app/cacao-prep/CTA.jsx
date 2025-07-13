"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const CacaoCTA = () => (
  <section className="py-16 px-4 md:px-8 max-w-2xl mx-auto text-center">
    <motion.h2
      className="text-3xl md:text-4xl font-bold mb-6 text-orange-900"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <span role="img" aria-label="cacao" className="mr-2">
        🍫
      </span>
      Want to go deeper?{" "}
    </motion.h2>
    <motion.div
      className="flex flex-col md:flex-row gap-6 items-center justify-center mt-10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <Link
        href="/events"
        className="px-8 py-4 rounded-lg bg-orange-700 text-white font-semibold shadow-lg hover:bg-orange-800 transition-colors text-lg w-full md:w-auto"
      >
        Join a Mama Cacao Ceremony
      </Link>
      <Link
        href="/contact?subject=Private%20Cacao%20Ceremony%20Request"
        className="px-8 py-4 rounded-lg border-2 border-orange-700 text-orange-800 font-semibold shadow-lg hover:bg-orange-50 transition-colors text-lg w-full md:w-auto"
      >
        Book a Private Cacao Ceremony
      </Link>
      <Link
        href="/shop/cacao"
        className="px-8 py-4 rounded-lg bg-orange-100 text-orange-900 font-semibold shadow-lg border-2 border-orange-200 hover:bg-orange-200 transition-colors text-lg w-full md:w-auto"
      >
        Order Ceremonial Cacao
      </Link>
    </motion.div>
    <motion.p
      className="mt-8 text-base md:text-lg text-gray-600 font-light"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.4 }}
    >
      For private ceremonies, you’ll be directed to our contact page with your
      request pre-filled.
    </motion.p>
  </section>
);

export default CacaoCTA;
