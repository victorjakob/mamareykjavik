"use client";
import React from "react";
import { motion } from "framer-motion";

const logoUrl =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752335914/mama-cacao-logo_seug7k.png";
const cacaoPlantUrl =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752335005/caca_c1ku48.webp";

const cacaoPlantUrl2 =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752336814/cacao-plant_r2allw.jpg";

const HeroCacao = () => (
  <section className="flex flex-col justify-center items-center text-center py-16 pt-24 lg:pt-32 px-4 md:px-8">
    <motion.h1
      className="text-3xl md:text-5xl font-light mb-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <span className="text-2xl md:text-4xl">- The Art of Making -</span>
      <br />
      <span className="text-4xl md:text-6xl">Ceremonial Cacao</span>
    </motion.h1>
    <motion.p
      className="max-w-xl font-extralight tracking-wide mx-auto text-lg md:text-xl  mb-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
    >
      A sacred cup to awaken your heart and center your spirit.
    </motion.p>
    <motion.p
      className="max-w-xl font-extralight tracking-wide mx-auto text-base md:text-lg "
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
    >
      "The food of the gods."
    </motion.p>
    {/* Logo trio: left faded logo, center logo, right cacao plant */}
    <div className="flex items-center justify-center gap-4 my-8 w-full">
      {/* Left faded logo */}
      <img
        src={cacaoPlantUrl2}
        alt="Cacao plant right"
        className="w-32 md:w-48 lg:w-60 h-auto mx-2 rounded-full object-cover"
        aria-hidden="true"
      />
      {/* Center main logo */}
      <img
        src={logoUrl}
        alt="Mama Cacao Logo center"
        className="w-32 md:w-48 lg:w-60 h-auto mx-2"
        aria-hidden="true"
      />
      {/* Right cacao plant image, rounded full */}
      <img
        src={cacaoPlantUrl}
        alt="Cacao plant right"
        className="w-32 md:w-48 lg:w-60 h-auto mx-2 rounded-full object-cover"
        aria-hidden="true"
      />
    </div>
  </section>
);

export default HeroCacao;
