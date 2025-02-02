"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export default function NextSteps() {
  return (
    <section className="my-5 sm:my-10 flex items-center justify-center px-4 py-8 sm:py-16 bg-[#fdfbf7] overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-4 sm:space-y-6 px-2 sm:px-4 md:order-1"
        >
          <h2 className="pt-1 pb-3 sm:pb-5 text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#455318] to-[#698d42] bg-clip-text text-transparent">
            Our Next Chapter
          </h2>

          <div className="space-y-3 sm:space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed">
            <p>
              As Mama has grown, so has our vision. We have expanded into a new
              space that houses both Mama and our newest endeavor, White Lotus -
              a cultural and spiritual hub for creativity, wellness, and
              transformation.
            </p>

            <p>
              This venue hosts yoga, dance, ceremonies, live performances, and
              conscious gatherings, deepening our mission to cultivate
              connection and uplift the collective spirit.
            </p>
          </div>

          <div className="flex flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
            <Link
              href="/events"
              className="flex-1 inline-block px-4 sm:px-6 py-2.5 sm:py-3 bg-[#455318] text-white rounded-lg sm:rounded-xl hover:bg-[#698d42] transition-colors duration-300 text-center text-sm sm:text-base"
            >
              Explore Our Events
            </Link>
            <Link
              href="/whitelotus"
              className="flex-1 inline-block px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-[#455318] text-[#455318] rounded-lg sm:rounded-xl hover:bg-[#455318] hover:text-white transition-colors duration-300 text-center text-sm sm:text-base"
            >
              Host Your Own Event
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative w-full aspect-square md:order-2 px-4 sm:px-0"
        >
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2FGenerated_Logo_White_Lotus_darktext_transparent.png?alt=media&token=59618fb8-21e8-483e-b4c0-b49d4651955f"
            alt="White Lotus Logo"
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
