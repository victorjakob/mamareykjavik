"use client";

import { motion } from "framer-motion";

export default function InfoVenue() {
  const items = [
    {
      title: "Capacity",
      details: "Standing: 150\nSeated: 80",
    },
    {
      title: "Location",
      details: "Bankastræti 2\nSecond Floor\nNext to Mama Reykjavik",
    },
    {
      title: "Technology",
      details:
        "Top Quality Sound system,\nProjector, Microphones,\nMixer, Stage lights",
    },
    {
      title: "Hours",
      details: "Weekdays \nuntil 1am\nWeekends \nuntil 3am",
    },
  ].filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className=" py-24">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center">
        <motion.h2
          className="text-4xl font-bold text-gray-900 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Venue Details
        </motion.h2>
        <motion.h3
          className="max-w-3xl text-center pb-16 text-xl text-gray-600 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Our venue is ideal for celebrations of all kinds, including DJ events,
          dances, cultural talks and sharings, graduations, birthdays, company
          parties, communion, engagements, weddings, ceremonies, yoga,
          breathwork and so much more!
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                ease: "easeOut",
              }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <div className="w-full aspect-square rounded-full p-8  shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center justify-center border border-gray-100">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur" />
                <div className="relative flex flex-col items-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {item?.title ?? ""}
                  </h2>
                  <p className="text-center text-gray-600 whitespace-pre-line">
                    {item?.details ?? ""}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
