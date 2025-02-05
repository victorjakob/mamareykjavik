"use client";

import { motion } from "framer-motion";

export default function LongTermVision() {
  return (
    <section className="relative min-h-screen mt-5 sm:mt-10 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 rounded-full bg-gradient-to-r from-emerald-300 to-teal-500 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-48 sm:w-96 h-48 sm:h-96 rounded-full bg-gradient-to-l from-green-300 to-emerald-500 blur-3xl"
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-10 sm:py-20 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-6 sm:space-y-8"
        >
          <h2 className="pt-1 pb-3 sm:pb-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#455318] to-[#698d42] bg-clip-text text-transparent">
            Our Long-Term Vision
          </h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-700 max-w-3xl mx-auto px-2"
          >
            Our journey doesn&apos;t stop with the walls of our restaurant. We
            envision a future where Mama becomes fully self-sustainable, with
            its own land for organic farming, powered by Iceland&apos;s abundant
            geothermal energy.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-700 max-w-3xl mx-auto px-2"
          >
            By growing our own food, reducing waste, and minimizing our
            environmental footprint, we aim to create a model of regenerative,
            conscious living—not just for Reykjavik, but as an example for
            communities worldwide.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
