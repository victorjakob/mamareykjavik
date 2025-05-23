"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function WhatWeOffer() {
  return (
    <section className="my-5 sm:my-10 flex items-center justify-center px-4 py-8 sm:py-16 bg-[#fdfbf7] overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-4 sm:space-y-6 px-2 sm:px-4 order-1"
        >
          <h2 className="pt-1 text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#455318] to-[#698d42] bg-clip-text text-transparent">
            What We Offer
          </h2>

          <div className="space-y-3 sm:space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed">
            <p>
              Mama is a 100% plant-based restaurant, serving high-quality,
              nourishing, and world wide inspired dishes. Our menu is designed
              to delight the senses while supporting personal well-being and
              environmental consciousness. But food is just one part of our
              mission.
            </p>

            <p>
              Alongside our restaurant, we host a variety of events that inspire
              and uplift, including music nights, art showcases, wellness
              workshops, and community gatherings. Our Tea/Tonic Bar serves
              carefully crafted herbal infusions, fresh juices, and our
              signature ceremonial cacao, a sacred heart-opening elixir that has
              become central to our ethos.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative w-full aspect-[4/3] md:aspect-[3/4] lg:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl order-2"
        >
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2FIMG_0947.jpeg?alt=media&token=8b852b13-1ae7-4702-a670-269138d271c5"
            alt="Mama Restaurant Offerings"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
