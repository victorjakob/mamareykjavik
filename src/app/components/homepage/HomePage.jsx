"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

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
    image: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1766576002/wl-cover_yzyuhz.jpg",
    logo: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1766567396/wl-darkbg_lfm9ye.png",
    link: "/whitelotus",
  },
];

const MotionLink = motion(Link);

export default function HomePage() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {sections.map((section) => (
        <MotionLink
          key={section.link}
          href={section.link}
          className="group relative flex-1 h-[50vh] md:h-screen overflow-hidden"
          layout
          whileHover={{ flexGrow: 1.2 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        >
          {/* Background image */}
          <motion.div
            className="absolute inset-0"
            initial={false}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
          >
            <Image
              src={section.image}
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center p-4 md:p-8">
            <div
              className={
                "relative w-16 h-16 md:w-32 md:h-32 " +
                (section.link === "/whitelotus" ? "self-end" : "self-start")
              }
            >
              {" "}
              <Image
                src={section.logo}
                alt={section.title + " logo"}
                fill
                className="object-contain"
              />
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-white">
              <h2 className="text-2xl md:text-5xl font-bold text-center mb-2 md:mb-4">
                {section.title}
              </h2>
              <p className="text-center max-w-md text-base md:text-lg px-2 mb-6 md:mb-8">
                {section.description}
              </p>

              <div className="flex items-center gap-2 text-white/90 group-hover:text-white transition-colors duration-300">
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
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  whileHover={{ opacity: 1 }}
                  initial={{ opacity: 0.9 }}
                >
                  <path
                    d="M6 12L10 8L6 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </div>
            </div>
          </div>
        </MotionLink>
      ))}
    </div>
  );
}
