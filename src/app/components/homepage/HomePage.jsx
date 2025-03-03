"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function HomePage() {
  const router = useRouter();
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

  useEffect(() => {
    const preferredSection = Cookies.get("preferredSection");
    if (preferredSection) {
      const section = sections.find((s) => s.title === preferredSection);
      if (section) {
        router.push(section.link);
      }
    }
  }, []);

  const handleSectionClick = (section) => {
    Cookies.set("preferredSection", section.title, { expires: 365 }); // Cookie expires in 1 year
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: -50 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
            duration: 0.8,
            type: "spring",
            bounce: 0.5,
          },
        }}
        className="absolute w-full text-center z-10 top-8 md:top-16 px-4"
      >
        <motion.h1
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          whileHover={{
            scale: 1.1,
            rotate: [0, -5, 5, -5, 0],
            transition: {
              duration: 0.5,
              rotate: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 0.5,
              },
            },
          }}
          className="pt-2 pb-2 leading-loose text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] cursor-default"
        >
          Welcome!
        </motion.h1>
        <motion.h2
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
          whileHover={{
            scale: 1.05,
            transition: { type: "spring", stiffness: 400 },
          }}
          className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] cursor-default"
        >
          Where would you like to start?
        </motion.h2>
      </motion.div>
      {sections.map((section, index) => (
        <Link
          href={section.link}
          key={index}
          className="relative flex-1 h-1/3 md:h-screen transition-all duration-500 ease-in-out overflow-hidden"
          onMouseEnter={() => setHoveredSection(index)}
          onMouseLeave={() => setHoveredSection(null)}
          onClick={() => handleSectionClick(section)}
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
              className={`relative w-20 h-20 md:w-32 md:h-32 self-start ${
                index === 1 ? "md:self-end" : ""
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
              <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 transition-all duration-300">
                {section.title}
              </h2>
              <p className="text-center max-w-md text-lg">
                {section.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
