"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";

const menuImages = [
  { id: 1, src: "/menu/1.jpg", alt: "Menu Page 1" },
  { id: 2, src: "/menu/2.jpg", alt: "Menu Page 2" },
  { id: 3, src: "/menu/3.jpg", alt: "Menu Page 3" },
  { id: 4, src: "/menu/4.jpg", alt: "Menu Page 4" },
  { id: 5, src: "/menu/5.jpg", alt: "Menu Page 5" },
  { id: 6, src: "/menu/6.jpg", alt: "Menu Page 6" },
];

export default function FoodMenu() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [direction, setDirection] = useState(0); // Track swipe direction: -1 (left), 1 (right)

  const handleImageClick = (index) => setSelectedImageIndex(index);

  const handleNext = () => {
    setDirection(1);
    setSelectedImageIndex((prevIndex) =>
      prevIndex === menuImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevious = () => {
    setDirection(-1);
    setSelectedImageIndex((prevIndex) =>
      prevIndex === 0 ? menuImages.length - 1 : prevIndex - 1
    );
  };

  const handleClose = () => setSelectedImageIndex(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex !== null) {
        if (e.key === "ArrowRight") handleNext();
        if (e.key === "ArrowLeft") handlePrevious();
        if (e.key === "Escape") handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrevious,
    onSwipedDown: handleClose,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  // Motion Variants for Page Sliding
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div className="flex items-center justify-center py-11 pb-28 overflow-hidden">
      {/* Deck of Cards */}
      <div className="relative w-[300px] h-[400px] cursor-pointer">
        {menuImages.map((image, index) => {
          const baseOffset = 15; // Base horizontal offset
          const reducedYOffset = 10 - index * 1.5; // Gradually reduce Y-axis offset
          const rotation = -5 + index * 3; // Progressive rotation

          return (
            <motion.div
              key={image.id}
              initial={{
                x: baseOffset * index, // Horizontal stacking
                y: reducedYOffset > 0 ? reducedYOffset : 0, // Gradually reduce, stop at 0
                rotate: rotation,
              }}
              animate={{
                x: baseOffset * index,
                y: reducedYOffset > 0 ? reducedYOffset : 0,
                rotate: rotation,
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ zIndex: menuImages.length - index }}
              className="absolute top-0 left-0 w-full aspect-[2/3] rounded-lg shadow-xl overflow-hidden"
              onClick={() => handleImageClick(index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Fullscreen Modal */}
      {selectedImageIndex !== null && (
        <motion.div
          {...swipeHandlers}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 flex items-center justify-center z-50"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white text-4xl font-bold"
          >
            &times;
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 text-white text-3xl"
          >
            &#10094;
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 text-white text-3xl"
          >
            &#10095;
          </button>

          {/* Sliding Image Animation */}
          <div className="relative w-3/4 h-3/4 overflow-hidden">
            <AnimatePresence custom={direction} initial={false}>
              <motion.div
                key={selectedImageIndex}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={direction}
                transition={{
                  x: { type: "tween", duration: 0.6, ease: "easeInOut" },
                  opacity: { duration: 0.2 },
                }}
                className="absolute w-full h-full"
              >
                <Image
                  src={menuImages[selectedImageIndex].src}
                  alt={menuImages[selectedImageIndex].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                  className="rounded-lg object-contain"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
