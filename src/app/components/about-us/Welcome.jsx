"use client";

import { motion } from "framer-motion";

export default function Welcome() {
  return (
    <section className="mt-32 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl text-center"
      >
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="pt-1 pb-6 text-3xl md:text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-[#455318] to-[#698d42] bg-clip-text text-transparent"
        >
          Welcome to Mama <br /> A Home for Nourishment & Community
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-700"
        >
          At Mama, we believe in the transformative power of conscious living
          and mindful nourishment. Our mission extends beyond serving delicious,
          wholesome food – we&apos;re here to cultivate a space where community
          thrives, health flourishes, and positive change takes root. Every meal
          we serve is a step towards a more sustainable, compassionate, and
          healthier world.
        </motion.p>
      </motion.div>
    </section>
  );
}
