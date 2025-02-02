"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import ContactForm from "../ContactForm";

export default function BePart() {
  return (
    <section className="flex items-center justify-center px-4 py-8 sm:py-16 bg-[#fdfbf7] overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-4 sm:space-y-6 px-2 sm:px-4"
        >
          <h2 className="pt-1 pb-3 sm:pb-5 text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#455318] to-[#698d42] bg-clip-text text-transparent">
            Be a part of <br /> the journey
          </h2>

          <div className="space-y-3 sm:space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed">
            <p>
              Mama is a living, breathing entity, shaped by the love and energy
              of everyone who walks through our doors. Whether you come for a
              meal, an event, or simply to share in the warmth of our space, you
              are part of something greater—a movement towards wholeness,
              connection, and sustainability.
            </p>

            <p>
              We invite you to join us, to experience the magic, and to
              co-create a future where food, community, and the planet thrive
              together.
            </p>

            <p className="italic mt-6 sm:mt-8">
              With love & gratitude,
              <br />
              The Mama Reykjavik Family
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full mt-4 sm:mt-0"
        >
          <ContactForm />
        </motion.div>
      </div>
    </section>
  );
}
