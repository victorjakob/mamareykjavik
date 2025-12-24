"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

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

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < breakpoint);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);

  return isMobile;
}

const ImageGallery = () => {
  const isMobile = useIsMobile(640);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageData, setImageData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mobile "See more" behavior (show first half, then reveal rest)
  const [showMore, setShowMore] = useState(false);
  const mobileInitialCount = Math.ceil(images.length / 2);

  const visibleImages = useMemo(() => {
    if (!isMobile) return imageData;
    if (showMore) return imageData;
    return imageData.slice(0, mobileInitialCount);
  }, [isMobile, showMore, imageData, mobileInitialCount]);

  const openModal = (index) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const goToNextImage = () =>
    setCurrentIndex((prev) => (prev + 1) % images.length);

  const goToPrevImage = () =>
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  // Load image dimensions to use real aspect ratios
  useEffect(() => {
    if (!images?.length) {
      setIsLoading(false);
      return;
    }

    const loadImageData = async () => {
      const loadedImages = await Promise.all(
        images.map((image, index) => {
          return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
              const aspectRatio = img.naturalWidth / img.naturalHeight;
              resolve({
                ...image,
                aspectRatio,
                index,
                width: img.naturalWidth,
                height: img.naturalHeight,
              });
            };
            img.onerror = () => {
              resolve({ ...image, aspectRatio: 1, index, width: 1, height: 1 });
            };
            img.src = image.src;
          });
        })
      );

      setImageData(loadedImages);
      setIsLoading(false);
    };

    loadImageData();
  }, []);

  // Close modal on Esc key press
  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && closeModal();
    if (isModalOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Keyboard navigation for the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;
      if (e.key === "ArrowRight") goToNextImage();
      if (e.key === "ArrowLeft") goToPrevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  if (isLoading) {
    return (
      <section className="relative py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-1.5 sm:gap-2 md:gap-3">
            {images.map((_, idx) => (
              <div
                key={idx}
                className="mb-2 sm:mb-3 md:mb-4 break-inside-avoid aspect-square rounded-lg sm:rounded-xl md:rounded-2xl  animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 w-full">
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 sm:mb-10 md:mb-12 lg:mb-14 text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
            Gallery
          </h2>
          <motion.div
            className="h-px bg-gradient-to-r from-transparent via-black/15 to-transparent max-w-xs mx-auto"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </motion.div>

        <div
          className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-1.5 sm:gap-2 md:gap-3"
          style={{ columnFill: "balance" }}
        >
          {visibleImages.map((img, idx) => (
            <motion.div
              key={`${img.src}-${img.index}`}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.55,
                delay: idx * 0.03,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mb-2 sm:mb-3 md:mb-4 break-inside-avoid"
            >
              <button
                type="button"
                className="relative w-full overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl bg-white/60 ring-1 ring-black/10 cursor-pointer group text-left"
                style={{ aspectRatio: img.aspectRatio || 1 }}
                onClick={() => openModal(img.index)}
                aria-label={`Open image: ${img.alt}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  loading={img.index < 6 ? "eager" : "lazy"}
                  quality={80}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Mobile: See more / See less */}
        {isMobile && imageData.length > mobileInitialCount && (
          <div className="mt-8 flex justify-center">
            <motion.button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 backdrop-blur px-5 py-3 text-sm font-medium text-gray-900 shadow-sm hover:shadow-md transition"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {showMore ? (
                <>
                  See less <ChevronUpIcon className="w-4 h-4" />
                </>
              ) : (
                <>
                  See more <ChevronDownIcon className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-2 sm:p-4"
            onClick={closeModal}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.28 }}
              className="relative w-full h-full max-w-7xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 left-4 z-[10000] bg-white rounded-full p-2 sm:p-3 shadow-lg cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px] hover:bg-gray-100 transition-colors"
                aria-label="Close image"
              >
                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              </button>

              <div className="relative w-full h-full" onClick={closeModal}>
                <Image
                  src={images[currentIndex].src}
                  alt={images[currentIndex].alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                  quality={95}
                />
              </div>

              <button
                className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/75 text-white rounded-full p-2 hover:bg-black/90 transition-colors z-[10000]"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevImage();
                }}
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>

              <button
                className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/75 text-white rounded-full p-2 hover:bg-black/90 transition-colors z-[10000]"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage();
                }}
                aria-label="Next image"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ImageGallery;
