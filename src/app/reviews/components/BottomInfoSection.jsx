"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerParent } from "./animations";

export default function BottomInfoSection({ t }) {
  return (
    <section className="border-t border-[#eee4d6] bg-[#f6f1ea]">
      <motion.div
        className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:px-8 lg:grid-cols-2"
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div variants={fadeUp} transition={{ duration: 0.45, ease: "easeOut" }}>
          <h2 className="text-2xl font-semibold md:text-3xl">{t.bottomTitle}</h2>
          <p className="mt-4 max-w-xl leading-8 text-[#5d4d3c]">{t.bottomText}</p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="rounded-3xl border border-[#e8dfd2] bg-white p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold">{t.tagsTitle}</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {t.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[#f8f2e9] px-4 py-2 text-sm text-[#6b563e]">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
