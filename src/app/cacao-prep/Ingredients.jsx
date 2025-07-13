"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const CacaoIngredients = () => (
  <section className="px-4 md:px-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
    {/* Image on the left */}
    <motion.div
      className="w-full md:w-1/2 flex justify-center"
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <Image
        src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752239806/cacao-beans_d6fjws.jpg"
        alt="Cacao beans"
        width={400}
        height={300}
        className="rounded-xl shadow-lg object-cover max-w-full"
        priority
      />
    </motion.div>
    {/* Text on the right */}
    <div className="w-full md:w-1/2 text-center md:text-left">
      <motion.h2
        className="text-2xl md:text-3xl font-semibold mb-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <span role="img" aria-label="ingredients" className="mr-2">
          🌿
        </span>
        Ingredients
      </motion.h2>
      <motion.div
        className="mb-4 text-lg md:text-xl font-light space-y-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="text-xl md:text-xl">
          20–40g ceremonial cacao,{" "}
          <span className="font-light">finely chopped or grated</span>
        </div>
        <div className="text-lg md:text-xl">
          100–200ml spring water or plant-based milk,{" "}
          <span className="font-light">depending on desired thickness</span>
        </div>
        <div className="text-base md:text-lg font-semibold">Optional:</div>
        <div className="text-base md:text-lg pl-2">
          - maple syrup, coconut sugar, or raw honey{" "}
          <span className="font-light">– for sweetness</span>
        </div>
        <div className="text-base md:text-lg pl-2">
          - a small spoon of coconut oil{" "}
        </div>
        <div className="text-base md:text-lg pl-2">
          - spices & herbs:{" "}
          <span className="font-light">
            follow your intuition. Common additions include:
          </span>
        </div>
        <div className="text-base md:text-lg pl-5 border-b border-gray-300 pb-5">
          Cinnamon, Cayenne, Cardamom, Vanilla, Rose petals, Pinch of salt
        </div>
      </motion.div>
      <motion.p
        className="text-base md:text-lg font-extralight mt-5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        Each ingredient is part of the medicine. Feel into what your body is
        calling for, trust your intuition.
      </motion.p>
    </div>
  </section>
);

export default CacaoIngredients;
