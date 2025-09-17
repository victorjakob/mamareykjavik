"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

// Elegant loading overlay with multiple design variants
export default function ElegantLoadingOverlay({
  isLoading,
  variant = "gradient",
  size = "md",
  className = "",
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <>
          {variant === "gradient" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`absolute inset-0 bg-gradient-to-br from-black/10 via-black/20 to-black/30 backdrop-blur-[1px] rounded-lg flex items-center justify-center ${className}`}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg"
              >
                <Loader2
                  className={`${sizeClasses[size]} text-gray-700 animate-spin`}
                />
              </motion.div>
            </motion.div>
          )}

          {variant === "pulse" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center ${className}`}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative"
              >
                {/* Pulse rings */}
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-blue-500/20 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                  className="absolute inset-0 bg-blue-500/30 rounded-full"
                />

                {/* Center spinner */}
                <div className="bg-white rounded-full p-2 shadow-md">
                  <Loader2
                    className={`${sizeClasses[size]} text-blue-600 animate-spin`}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}

          {variant === "shimmer" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute inset-0 rounded-lg overflow-hidden ${className}`}
            >
              {/* Shimmer effect */}
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                style={{ transform: "skewX(-20deg)" }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg"
                >
                  <Loader2
                    className={`${sizeClasses[size]} text-gray-600 animate-spin`}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {variant === "dots" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute inset-0 bg-black/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center ${className}`}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg flex items-center gap-2"
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                      className="w-2 h-2 bg-blue-600 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-700 font-medium ml-1">
                  Loading
                </span>
              </motion.div>
            </motion.div>
          )}

          {variant === "minimal" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`absolute inset-0 bg-black/5 rounded-lg flex items-center justify-center ${className}`}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
              >
                <Loader2
                  className={`${sizeClasses[size]} text-gray-500 animate-spin`}
                />
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// Preset configurations for common use cases
export const LoadingVariants = {
  elegant: { variant: "gradient", size: "md" },
  subtle: { variant: "minimal", size: "sm" },
  animated: { variant: "pulse", size: "md" },
  premium: { variant: "shimmer", size: "md" },
  playful: { variant: "dots", size: "md" },
};
