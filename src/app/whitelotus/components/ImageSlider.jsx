"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useInView,
  useAnimationControls,
} from "framer-motion";
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
  const sliderRef = useRef(null);
  const sliderElementRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(sliderRef, { once: false, margin: "-100px" });
  const resumeTimeoutRef = useRef(null);
  const isScrollingRef = useRef(false);
  const controls = useAnimationControls();
  const currentXRef = useRef("0%");

  // Check if device supports hover (for conditional hover effects)
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(hover: hover)");
      setCanHover(mediaQuery.matches);

      const handleChange = (e) => setCanHover(e.matches);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  // Calculate animation duration based on screen size
  const getAnimationDuration = () => {
    if (typeof window === "undefined") return 12;
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) return 2.5; // Much faster for mobile
    if (screenWidth < 1024) return 8; // Medium for tablets
    return 12; // Default for desktop
  };

  const [animationDuration] = useState(getAnimationDuration);

  // Create seamless loop by duplicating images
  const duplicatedImages = [...images, ...images];

  // Animation configuration
  const animationConfig = {
    x: ["0%", `-${(images.length / duplicatedImages.length) * 100}%`],
    transition: {
      repeat: Infinity,
      repeatType: "loop",
      duration: animationDuration,
      ease: "linear",
    },
  };

  const openModal = (index) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
    // Don't stop animation when modal opens - let it continue in background
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

  // Track if animation should be playing (using ref to avoid rerenders during scroll)
  const shouldAnimate =
    !prefersReducedMotion && isInView && !isScrollingRef.current;

  // Update current position during animation
  const handleAnimationUpdate = (latest) => {
    if (latest.x) {
      currentXRef.current = latest.x;
    }
  };

  // Start animation when component mounts and is in view
  useEffect(() => {
    if (shouldAnimate) {
      const startX = currentXRef.current || "0%";
      controls.start({
        x: [startX, `-${(images.length / duplicatedImages.length) * 100}%`],
        transition: {
          repeat: Infinity,
          repeatType: "loop",
          duration: animationDuration,
          ease: "linear",
        },
      });
    } else {
      controls.stop();
    }
  }, [shouldAnimate, animationDuration, controls]);

  // Ensure animation resumes correctly after modal closes
  useEffect(() => {
    if (!isModalOpen && shouldAnimate) {
      // Small delay to ensure state is settled
      const timeoutId = setTimeout(() => {
        const startX = currentXRef.current || "0%";
        // Stop any existing animation to restart fresh
        controls.stop();
        // Restart with correct position and duration
        controls.start({
          x: [startX, `-${(images.length / duplicatedImages.length) * 100}%`],
          transition: {
            repeat: Infinity,
            repeatType: "loop",
            duration: animationDuration,
            ease: "linear",
          },
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [
    isModalOpen,
    shouldAnimate,
    animationDuration,
    controls,
    images.length,
    duplicatedImages.length,
  ]);

  // Detect scrolling and pause animation (using refs to avoid React rerenders during scroll)
  useEffect(() => {
    const onScroll = () => {
      isScrollingRef.current = true;
      controls.stop();

      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);

      resumeTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;

        if (!prefersReducedMotion && isInView) {
          const startX = currentXRef.current || "0%";
          controls.start({
            x: [startX, `-${(images.length / duplicatedImages.length) * 100}%`],
            transition: {
              repeat: Infinity,
              repeatType: "loop",
              duration: animationDuration,
              ease: "linear",
            },
          });
        }
      }, 200);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [
    controls,
    prefersReducedMotion,
    isInView,
    animationDuration,
    images.length,
    duplicatedImages.length,
  ]);

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

  return (
    <div
      id="whitelotus-gallery"
      className={styles.sliderWrapper}
      ref={sliderRef}
    >
      <div className={styles.sliderContainer}>
        <motion.div
          ref={sliderElementRef}
          className={styles.slider}
          animate={controls}
          onUpdate={handleAnimationUpdate}
          style={{ width: `${duplicatedImages.length * 100}%` }}
          onHoverStart={() => {
            if (shouldAnimate) {
              controls.stop();
            }
          }}
          onHoverEnd={() => {
            if (shouldAnimate) {
              const startX = currentXRef.current || "0%";
              controls.start({
                x: [
                  startX,
                  `-${(images.length / duplicatedImages.length) * 100}%`,
                ],
                transition: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: animationDuration,
                  ease: "linear",
                },
              });
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
                {...(canHover ? { whileHover: { scale: 1.03 } } : {})}
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
              onClick={closeModal}
              className="absolute top-4 left-4 z-[10000] bg-white rounded-full p-2 sm:p-3 shadow-lg cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label="Close image"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </button>

            {/* Current Image */}
            <div className="relative w-full h-full" onClick={closeModal}>
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
