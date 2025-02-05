"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const RentVenue = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="border-t border-gray-700 py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-light text-gray-900 mb-6"
        >
          Interested in Hosting Your Own Event at White Lotus?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg font-light text-gray-600 mb-10"
        >
          Our unique venue offers the perfect space for conscious gatherings,
          workshops, ceremonies, and more.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center"
        >
          <motion.div
            whileHover={{
              scale: 1.05,
              rotate: [0, 1, -1, 0],
              transition: { duration: 0.3 },
            }}
          >
            <Link
              href="/whitelotus"
              className="inline-flex items-center justify-center px-10 py-4 text-base font-light tracking-wider rounded-full text-white bg-black hover:bg-gray-700 transition-all duration-300 hover:shadow-xl"
            >
              Explore White Lotus
            </Link>
          </motion.div>
          <motion.div
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 8px rgba(0,0,0,0.2)",
              transition: { duration: 0.2 },
            }}
          >
            <Link
              href="/whitelotus/rent"
              className="inline-flex items-center justify-center px-10 py-4 text-base font-light tracking-wider rounded-full text-black border border-black hover:bg-black hover:text-white transition-all duration-300 hover:shadow-xl"
            >
              Contact Us
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RentVenue;
