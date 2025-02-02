"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import HeroVideo from "./HeroVideo";
import HeroWl from "./HeroWL";

export default function Hero() {
  const [currentHero, setCurrentHero] = useState(0);
  const heroes = [HeroVideo, HeroWl];

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setCurrentHero(
      (prevIndex) => (prevIndex + newDirection + heroes.length) % heroes.length
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        paginate(1);
      } else if (e.key === "ArrowLeft") {
        paginate(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const CurrentHeroComponent = heroes[currentHero];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AnimatePresence initial={false} custom={currentHero}>
        <motion.div
          key={currentHero}
          custom={currentHero}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute w-full h-full"
        >
          <CurrentHeroComponent />
        </motion.div>
      </AnimatePresence>

      {currentHero === 0 && (
        <motion.button
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-4 sm:right-6 top-[65%] sm:top-1/2 transform -translate-y-1/2 z-10 p-2 sm:p-4 rounded-full bg-white/30 backdrop-blur-md shadow-lg hover:bg-white/40 transition-colors border-2 border-white/50"
          onClick={() => paginate(1)}
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
        </motion.button>
      )}

      {currentHero === 1 && (
        <motion.button
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-4 sm:left-6 top-[65%] sm:top-1/2 transform -translate-y-1/2 z-10 p-2 sm:p-4 rounded-full bg-white/30 backdrop-blur-md shadow-lg hover:bg-white/40 transition-colors border-2 border-white/50"
          onClick={() => paginate(-1)}
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
        </motion.button>
      )}
    </div>
  );
}
