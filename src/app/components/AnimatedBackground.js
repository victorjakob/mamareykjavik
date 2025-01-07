"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [pageHeight, setPageHeight] = useState(0);

  // Dynamically update the page height
  useEffect(() => {
    const updatePageHeight = () => setPageHeight(document.body.scrollHeight);
    updatePageHeight();
    window.addEventListener("resize", updatePageHeight);
    return () => window.removeEventListener("resize", updatePageHeight);
  }, []);

  // Generate random positions for animated shapes
  const randomPosition = () => {
    if (typeof window === "undefined") {
      // Default positions during SSR
      return { top: "0px", left: "0px" };
    }

    const shapeWidth = 36.125 * 16; // Convert rem to px
    const maxLeft = window.innerWidth - shapeWidth; // Ensure shape fits within the viewport
    const pageHeight = document.body.scrollHeight;

    return {
      top: `${Math.random() * pageHeight}px`,
      left: `${Math.random() * maxLeft}px`,
    };
  };

  return (
    <>
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className="absolute -z-10 aspect-[1155/678] w-[36.125rem] max-w-full bg-gradient-to-tr from-[#455318] via-[#455318aa] to-[#96bf6b88] opacity-20 blur-3xl"
          style={randomPosition()} // Safe usage of window
          animate={{
            x: ["0%", "5%", "-5%", "0%"], // Ensure movement stays minimal
            y: ["0%", "-2%", "2%", "0%"],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 6,
          }}
        />
      ))}
    </>
  );
}
