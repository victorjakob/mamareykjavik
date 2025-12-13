"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import Image from "next/image";
import styles from "./ImageSlider.module.css";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

const images = [
  {
    src: "/whitelotus/whitelotus1.jpg",
    caption: "DJ & Dance Nights",
    alt: "DJ and dance event at White Lotus",
  },
  {
    src: "/whitelotus/whitelotus2.jpg",
    caption: "Live Music",
    alt: "Live music performance at White Lotus",
  },
  {
    src: "/whitelotus/whitelotus3.jpg",
    caption: "Ceremonies",
    alt: "Ceremony at White Lotus",
  },
  {
    src: "/whitelotus/whitelotus4.jpg",
    caption: "Talks & Culture",
    alt: "Cultural talk at White Lotus",
  },
  {
    src: "/whitelotus/whitelotus5.jpg",
    caption: "Private Celebrations",
    alt: "Private celebration at White Lotus",
  },
  {
    src: "/whitelotus/whitelotus6.jpg",
    caption: "DJ & Dance Nights",
    alt: "DJ and dance event at White Lotus",
  },
  {
    src: "/whitelotus/whitelotus7.jpg",
    caption: "Live Music",
    alt: "Live music performance at White Lotus",
  },
  {
    src: "/whitelotus/whitelotus8.jpg",
    caption: "Ceremonies",
    alt: "Ceremony at White Lotus",
  },
  {
    src: "/whitelotus/whitelotus9.jpg",
    caption: "Talks & Culture",
    alt: "Cultural talk at White Lotus",
  },
  {
    src: "/whitelotus/whitelotus10.jpg",
    caption: "Private Celebrations",
    alt: "Private celebration at White Lotus",
  },
  {
    src: "/whitelotus/whitelotus11.jpg",
    caption: "DJ & Dance Nights",
    alt: "DJ and dance event at White Lotus",
  },
];

const ImageSlider = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(sliderRef, { once: false, margin: "-100px" });

  // Calculate animation duration based on screen size
  const getAnimationDuration = () => {
    if (typeof window === "undefined") return 12;
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) return 5; // Faster for mobile
    if (screenWidth < 1024) return 10; // Medium for tablets
    return 12; // Default for desktop
  };

  const [animationDuration] = useState(getAnimationDuration);

  const openModal = (index) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Pause animation when not in view or when user prefers reduced motion
  useEffect(() => {
    setIsPaused(prefersReducedMotion || !isInView);
  }, [prefersReducedMotion, isInView]);

  // Close modal on Esc key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  // Keyboard navigation for the image slider
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isModalOpen) return; // Don't navigate if modal is open
      if (e.key === "ArrowRight") goToNextImage();
      if (e.key === "ArrowLeft") goToPrevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Create seamless loop by duplicating images
  const duplicatedImages = [...images, ...images];

  return (
    <div className={styles.sliderWrapper} ref={sliderRef}>
      <div className={styles.sliderContainer}>
        <motion.div
          className={styles.slider}
          animate={
            isPaused
              ? {}
              : {
                  x: [
                    "0%",
                    `-${(images.length / duplicatedImages.length) * 100}%`,
                  ],
                }
          }
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: animationDuration,
            ease: "linear",
          }}
          style={{ width: `${duplicatedImages.length * 100}%` }}
          onHoverStart={() => setIsPaused(true)}
          onHoverEnd={() => {
            if (!prefersReducedMotion && isInView) {
              setIsPaused(false);
            }
          }}
        >
          {duplicatedImages.map((image, index) => {
            const originalIndex = index % images.length;
            return (
              <motion.div
                key={`${image.src}-${index}`}
                className={styles.slide}
                onClick={() => openModal(originalIndex)}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="relative w-full h-64">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover rounded-md cursor-pointer"
                    priority={index < 3}
                    quality={index < 3 ? 85 : 70}
                    loading={index < 3 ? "eager" : "lazy"}
                  />
                </div>
              </motion.div>
            );
          })}
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
                src={images[currentIndex].src}
                alt={images[currentIndex].alt}
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
