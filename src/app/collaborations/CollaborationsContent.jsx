"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

const partners = [
  {
    name: "Maul.is",
    description:
      "Corporate catering and food delivery partner, sharing Mama's vibrant, plant-forward meals with workplaces across Iceland.",
    website: "https://maul.is",
    logo: null, // Can be added later if needed
  },
  // Add more partners here as needed
];

export default function CollaborationsContent() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="mt-24 md:mt-32 flex items-center justify-center px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl text-center"
        >
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="pt-1 pb-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-wide mb-3 md:mb-4 text-gray-800"
          >
            Our Trusted Partners
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed text-gray-600 font-light tracking-wide"
          >
            We&apos;re proud to collaborate with like-minded Icelandic companies who
            share our passion for quality, sustainability, and community.
          </motion.p>
        </motion.div>
      </section>

      {/* Partners Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="space-y-4 md:space-y-6">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
            >
              <Link
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-4 sm:p-5 md:p-6 border border-gray-200 hover:border-gray-400 hover:bg-gray-50/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-light tracking-wide text-gray-800 mb-2 group-hover:text-gray-900 transition-colors flex items-center gap-2">
                      {partner.name}
                      <ArrowUpRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 flex-shrink-0" />
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed font-light tracking-wide">
                      {partner.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mb-12 md:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="text-center border-t border-gray-200 pt-6 md:pt-8"
        >
          <h3 className="text-lg sm:text-xl md:text-2xl font-light tracking-wide text-gray-800 mb-2 md:mb-3">
            Interested in Partnering?
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-5 md:mb-6 font-light tracking-wide px-2">
            We&apos;re always looking to connect with companies that align with our
            values and mission.
          </p>
          <Link
            href="/contact"
            className="inline-block px-5 sm:px-6 py-2 border border-gray-300 text-gray-700 text-xs sm:text-sm font-light tracking-wider hover:bg-gray-50 transition-all duration-300"
          >
            Get in Touch
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
