"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Story() {
  return (
    <section className="my-5 sm:my-10 flex items-center justify-center px-4 py-8 sm:py-16 bg-[#fdfbf7] overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl order-2 md:order-1"
        >
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2FIMG_0943%20Large.jpeg?alt=media&token=d92fba85-d61f-4c4f-9be2-e9712a889c25"
            alt="Mama Restaurant Interior"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-4 sm:space-y-6 px-2 sm:px-4 order-1 md:order-2"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#455318] to-[#698d42] bg-clip-text text-transparent pt-1">
            The Birth of Mama
          </h2>

          <div className="space-y-3 sm:space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed">
            <p>
              Mama was born from a simple idea—a group of friends seeking to
              create a space that embodied love, sustainability, and
              nourishment. What started as a humble desire to craft the best
              hummus in town quickly evolved into a vegan haven, a communal
              space where wellness and creativity intertwine.
            </p>

            <p>
              We found our home in one of Reykjavik's historical buildings, and
              with dedication and heart, we transformed it into a thriving hub
              for conscious living. Mama is not just about serving plant-based
              meals; it is about fostering an environment where culture, art,
              spirituality, and sustainability come together in harmony.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
