"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Constants for shape dimensions and animation
  const SHAPE_WIDTH_REM = 42.125;
  const SHAPE_WIDTH_PX = SHAPE_WIDTH_REM * 16;
  const SHAPE_ASPECT_RATIO = 1155 / 678;
  const SHAPE_HEIGHT = SHAPE_WIDTH_PX / SHAPE_ASPECT_RATIO;
  const NUM_SHAPES = 5;
  const ANIMATION_DURATION = 30;
  const ANIMATION_DELAY = 6;

  // Setup resize listener
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector("body");
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    updateDimensions();

    const debouncedResize = debounce(updateDimensions, 250);
    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, []);

  // Debounce helper
  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  const positions = [
    { top: "10%", left: "5%" },
    { top: "60%", left: "70%" },
    { top: "30%", left: "40%" },
    { top: "80%", left: "20%" },
    { top: "20%", left: "80%" },
  ];
  return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(NUM_SHAPES)].map((_, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className="absolute -z-10 aspect-[1155/678] w-[36.125rem] max-w-full bg-gradient-to-tr from-[#455318] via-[#455318aa] to-[#96bf6b88] opacity-10 blur-3xl"
          style={positions[i]}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 0.1,
            x: ["0%", "2%", "-2%", "0%"],
            y: ["0%", "-1%", "1%", "0%"],
          }}
          transition={{
            opacity: { duration: 2, ease: "easeIn" },
            duration: ANIMATION_DURATION,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * ANIMATION_DELAY,
          }}
        />
      ))}
    </div>
  );
}
