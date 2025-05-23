"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HomePage() {
  const [hoveredSection, setHoveredSection] = useState(null);

  const sections = [
    {
      title: "Mama Restaurant",
      description: "Honest, Real food, made with love and care.",
      image: "/mamaimg/mamavibe1.jpg",
      logo: "/mamaimg/mamalogo.png",
      link: "/restaurant",
    },
    {
      title: "White Lotus Venue",
      description:
        "Events of all kinds, bringing people together from all walks of life.",
      image: "/whitelotus/white.jpeg",
      logo: "/whitelotus/whitelotuslogo.png",
      link: "/events",
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
              <p className="text-center max-w-md text-base md:text-lg px-2">
                {section.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
