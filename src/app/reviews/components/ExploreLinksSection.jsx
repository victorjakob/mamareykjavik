"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerParent } from "./animations";

export default function ExploreLinksSection({ t }) {
  return (
    <section className="border-t border-[#eee4d6]">
      <motion.div
        className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-14"
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.h2
          variants={fadeUp}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="text-center text-2xl font-semibold md:text-3xl"
        >
          {t.exploreTitle}
        </motion.h2>

        <motion.div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" variants={staggerParent}>
          {t.exploreLinks.map((item) => (
            <motion.div key={item.href} variants={fadeUp} transition={{ duration: 0.35, ease: "easeOut" }}>
              <Link
                href={item.href}
                className="block rounded-full border border-[#d8c7ac] px-5 py-3 text-center text-sm font-medium text-[#5f4932] transition hover:-translate-y-0.5 hover:border-[#c7aa80]"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
