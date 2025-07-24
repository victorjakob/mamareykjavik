"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const EventsHeroLogo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
        delay: 0.05,
      }}
      className="relative flex flex-col items-center justify-center px-4"
    >
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.4,
            delay: 0.15,
            ease: "easeOut",
          }}
          className="relative w-72 sm:w-96 md:w-[500px] h-40 sm:h-48 md:h-64 mx-auto mb-6"
        >
          <Image
            src="/whitelotus/whitelotuslogo.png"
            alt="White Lotus Logo"
            fill
            className="object-contain"
            priority
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.3,
            ease: "easeOut",
          }}
          className="flex items-center justify-center gap-4"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 0.3,
              delay: 0.4,
              ease: "easeOut",
            }}
            className="w-16 h-[1px] bg-gray-900 origin-left"
          />
          <h2 className="text-xl md:text-2xl font-light text-gray-900">
            Upcoming Events
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 0.3,
              delay: 0.4,
              ease: "easeOut",
            }}
            className="w-16 h-[1px] bg-gray-900 origin-right"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EventsHeroLogo;
