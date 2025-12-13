"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HomePage() {
  const [hoveredSection, setHoveredSection] = useState(null);

  // Always use English text for home page
  const t = {
    restaurant: {
      title: "Mama Restaurant",
      description: "Honest, Real food, made with love and care.",
    },
    venue: {
      title: "White Lotus Venue",
      description:
        "Events of all kinds, bringing people together from all walks of life.",
    },
  };

  const sections = [
    {
      title: t.restaurant.title,
      description: t.restaurant.description,
      image: "/mamaimg/mamavibe1.jpg",
      logo: "/mamaimg/mamalogo.png",
      link: "/restaurant",
    },
    {
      title: t.venue.title,
      description: t.venue.description,
      image: "/whitelotus/white.jpeg",
      logo: "/whitelotus/whitelotuslogo.png",
      link: "/whitelotus",
    },
  ];

  return (
    <div className="min-h-screen max-h-screen w-full flex flex-col md:flex-row relative">
      {sections.map((section, index) => (
        <Link
          href={section.link}
          key={index}
          className="relative flex-1 h-[50vh] md:h-screen transition-all duration-500 ease-in-out overflow-hidden"
          onMouseEnter={() => setHoveredSection(index)}
          onMouseLeave={() => setHoveredSection(null)}
          style={{
            flex: hoveredSection === index ? "1.2" : "0.9",
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
            style={{
              backgroundImage: `url(${section.image})`,
              transform: hoveredSection === index ? "scale(1.02)" : "scale(1)",
            }}
          />
          <div className="absolute inset-0 bg-black/40 transition-opacity duration-500" />

          <div className="absolute inset-0 flex flex-col items-center p-4 md:p-8">
            <div
              className={`relative w-16 h-16 md:w-32 md:h-32 ${
                index === 1 ? "self-end" : "self-start"
              }`}
            >
              <Image
                src={section.logo}
                alt={`${section.title} logo`}
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex-1 flex flex-col justify-center items-center text-white">
              <h2 className="text-2xl md:text-5xl font-bold text-center mb-2 md:mb-4 transition-all duration-300">
                {section.title}
              </h2>
              <p className="text-center max-w-md text-base md:text-lg px-2 mb-6 md:mb-8">
                {section.description}
              </p>
              <motion.div
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors duration-300"
                initial={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-sm md:text-base font-light tracking-wider uppercase">
                  Enter
                </span>
                <motion.svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="md:w-5 md:h-5"
                  animate={{
                    x: hoveredSection === index ? [0, 4, 0] : 0,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <path
                    d="M6 12L10 8L6 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </motion.div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
