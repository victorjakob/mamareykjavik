"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, staggerParent } from "./animations";

export default function HeroReviewSection({ t, heroGallery }) {
  return (
    <section className="border-b border-[#eee4d6] bg-gradient-to-b from-[#f8f2e9] to-[#faf7f2]">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-24">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={staggerParent}
          initial="hidden"
          animate="show"
        >
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-4 text-sm uppercase tracking-[0.25em] text-[#a77d3b]"
          >
            {t.eyebrow}
          </motion.p>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-4xl font-semibold leading-tight text-[#2b221b] md:text-6xl"
          >
            {t.heading}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-6 max-w-2xl text-lg leading-8 text-[#5d4d3c]"
          >
            {t.intro}
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-8 grid gap-3 md:grid-cols-2"
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.45, ease: "easeOut" }}
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-3xl"
          >
            <Image
              src={heroGallery[0].src}
              alt={heroGallery[0].alt}
              width={900}
              height={700}
              className="h-full min-h-[220px] w-full object-cover md:min-h-[280px]"
              priority
            />
          </motion.div>

          <div className="grid gap-3">
            {[heroGallery[1], heroGallery[2]].map((image) => (
              <motion.div
                key={image.src}
                variants={fadeUp}
                transition={{ duration: 0.45, ease: "easeOut" }}
                whileHover={{ scale: 1.01 }}
                className="relative overflow-hidden rounded-3xl"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={900}
                  height={420}
                  className="h-full min-h-[130px] w-full object-cover md:min-h-[136px]"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
