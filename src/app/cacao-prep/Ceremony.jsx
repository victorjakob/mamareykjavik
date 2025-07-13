"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const CacaoCeremony = () => (
  <section className="py-12 px-4 md:px-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
    {/* Image on the left */}
    <motion.div
      className="w-full md:w-1/2 flex justify-center"
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <Image
        src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752239808/giving-thanks_xibufq.jpg"
        alt="Cacao plant illustration"
        width={400}
        height={300}
        className="rounded-xl shadow-lg object-cover max-w-full"
        priority
      />
    </motion.div>
    {/* Text on the right */}
    <div className="w-full md:w-1/2 text-center md:text-left">
      <motion.h2
        className="text-2xl md:text-3xl font-semibold mb-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <span role="img" aria-label="sparkles" className="mr-2">
          ✨
        </span>
        Make it Sacred!
      </motion.h2>
      <motion.p
        className="text-lg md:text-xl font-light mb-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        When you prepare cacao for use in a ceremony, make the preparation a
        ritual itself.
      </motion.p>
      <motion.div
        className="space-y-4 text-base md:text-lg font-extralight text-left mx-auto max-w-md"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <div>
          Be mindful of <span className="italic">why</span> you are preparing
          your cacao.
        </div>
        <div>Take your time</div>
        <div>Send your prayers and intentions to the drink as you make it</div>
        <div>Hold love in your heart as you do</div>
        <div>Serve it in your favourite mug or ceremonial cup</div>
      </motion.div>
    </div>
  </section>
);

export default CacaoCeremony;
