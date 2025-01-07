"use client";

import { motion } from "framer-motion";
import { ButtonDark } from "../Button";
export default function CTA() {
  return (
    <div
      className="relative w-full p-32
    flex items-center justify-center overflow-hidden bg-gray-900 text-white"
    >
      {/* Left Curtain */}
      <motion.div
        className="absolute top-0 left-0 h-full w-1/2 bg-indigo-950"
        initial={{ x: 0 }}
        whileInView={{ x: "-100%" }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Right Curtain */}
      <motion.div
        className="absolute top-0 right-0 h-full w-1/2 bg-indigo-950"
        initial={{ x: 0 }}
        whileInView={{ x: "100%" }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* CTA Content */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="text-4xl font-bold mb-4">
          Ready to create your epic event?
        </h2>
        <p className="text-lg mb-6">
          Let us help you bring your vision to life!
        </p>
        <ButtonDark href={"whitelotus/rent"} label={"Book Your Event Now"}>
          Contact Us
        </ButtonDark>
      </motion.div>
    </div>
  );
}
