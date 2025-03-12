"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./ImageSlider.module.css";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

const images = [
  "/whitelotus/whitelotus1.jpg",
  "/whitelotus/whitelotus2.jpg",
  "/whitelotus/whitelotus3.jpg",
  "/whitelotus/whitelotus4.jpg",
  "/whitelotus/whitelotus5.jpg",
  "/whitelotus/whitelotus6.jpg",
  "/whitelotus/whitelotus7.jpg",
  "/whitelotus/whitelotus8.jpg",
  "/whitelotus/whitelotus9.jpg",
  "/whitelotus/whitelotus10.jpg",
  "/whitelotus/whitelotus11.jpg",
];

const ImageSlider = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationDuration, setAnimationDuration] = useState(20); // Default duration

  const openModal = (index) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length); // Loop back to the first image
  };

  const goToPrevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    ); // Loop back to the last image
  };

  const updateAnimationDuration = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      setAnimationDuration(5); // Faster for smaller screens
    } else if (screenWidth < 1024) {
      setAnimationDuration(15); // Medium speed for tablets
    } else {
      setAnimationDuration(20); // Default for larger screens
    }
  };

  // Update animation duration based on screen size
  useEffect(() => {
    updateAnimationDuration();
    window.addEventListener("resize", updateAnimationDuration);
    return () => window.removeEventListener("resize", updateAnimationDuration);
  }, []);

  // Close modal on Esc key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal(); // Close the modal
      }
    };

    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown); // Add listener when modal is open
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown); // Cleanup on modal close
    };
  }, [isModalOpen]); // Rerun effect when `isModalOpen` changes

  // Keyboard navigation for the image slider
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") goToNextImage();
      if (e.key === "ArrowLeft") goToPrevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={styles.sliderWrapper}>
      <div className={styles.sliderContainer}>
        <motion.div
          key={animationDuration}
          className={styles.slider}
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: animationDuration,
            ease: "linear",
          }}
          style={{ width: `${images.length * 100}%` }} // Ensure slider width matches content
        >
          {images.map((image, index) => (
            <motion.div
              key={index}
              className={styles.slide}
              onClick={() => openModal(index)} // Pass index for navigation
              whileHover={{ scale: 1.1 }}
            >
              <div className="relative w-full h-64">
                <Image
                  src={image}
                  alt={`Slide ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover rounded-md cursor-pointer"
                  priority={index === 0}
                  quality={75}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={closeModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            touchAction: "none",
          }}
        >
          <motion.div
            className={styles.modalContent}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "90vw",
              height: "90vh",
              backgroundColor: "transparent",
              touchAction: "none",
            }}
          >
            <button
              className={styles.closeButton}
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                zIndex: 10000,
                backgroundColor: "white",
                borderRadius: "50%",
                padding: "0.5rem",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XMarkIcon className="w-6 h-6 text-black" />
            </button>

            {/* Current Image */}
            <div
              className="relative w-full h-full"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeModal();
                }
              }}
            >
              <Image
                src={images[currentIndex]}
                alt={`Fullscreen View ${currentIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
                quality={100}
              />
            </div>

            {/* Navigation Buttons */}
            <button
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/75 text-white rounded-full p-2 hover:bg-black/90"
              onClick={goToPrevImage}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/75 text-white rounded-full p-2 hover:bg-black/90"
              onClick={goToNextImage}
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
