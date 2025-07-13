"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const steps = [
  "Chop the cacao finely.",
  "Warm the water gently – don’t let it boil.",
  "Add water slowly to the cacao, on low heat, creating a paste and slowly finding the right consistency.",
  "Mix in spices of your choice.",
  "Blend if you like it frothy – this activates the texture beautifully. Step 3 is not neccesary if you use a blender.",
  "Pour into your favorite cup.",
];

const CacaoPreparation = () => (
  <section className="py-12 px-4 md:px-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
    {/* Text on the left */}
    <div className="w-full md:w-1/2 text-center md:text-left">
      <motion.h2
        className="text-2xl md:text-3xl font-semibold mb-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <span role="img" aria-label="fire" className="mr-2">
          🔥
        </span>
        How to Prepare the Cacao
      </motion.h2>
      <motion.ol
        className="mb-4 text-lg md:text-xl font-light space-y-2 list-decimal list-inside text-left mx-auto max-w-md"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        {steps.map((step, idx) => (
          <li key={idx}>{step}</li>
        ))}
      </motion.ol>
    </div>
    {/* Image on the right */}
    <motion.div
      className="w-full md:w-1/2 flex justify-center"
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <Image
        src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752238745/ceremonial-cacao-cup_twp40h.jpg"
        alt="Ceremonial cacao cup"
        width={400}
        height={300}
        className="rounded-xl shadow-lg object-cover max-w-full"
        priority
      />
    </motion.div>
  </section>
);

export default CacaoPreparation;
