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
      title: "Tec",
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
    <div className="container flex flex-col items-center justify-center p-10">
      <h2 className="text-3xl mb-16 text-center">Venue Details</h2>
      <h3 className="max-w-full md:max-w-3/5 lg:max-w-1/2 text-center pb-16 text-xl">
        Our venue is ideal for celebrations of all kinds, including Dj events,
        dances, cultural talks and sharings, graduations, birthdays, company
        parties, communion, engagements, weddings, ceremonies, yoga. breathwork
        and so much more!
      </h3>
      <div className="flex flex-wrap justify-center items-center gap-14">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="w-44 h-44 rounded-full flex flex-col items-center justify-center p-6 shadow-xl shadow-slate-400 "
            style={{
              background: "radial-gradient(circle, #6b46c1, #44337a)",
            }}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{
              scale: 1.1,
            }}
            transition={{
              delay: index * 0.1,
              duration: 0.5,
              ease: "easeOut",
            }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <h2 className="text-lg text-color-white font-medium mb-2">
              {item?.title ?? ""}
            </h2>
            <p className="text-center text-sm text-color-whitecream ">
              {item?.details ?? ""}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
