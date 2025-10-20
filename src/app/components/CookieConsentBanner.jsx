"use client";
import { useState } from "react";
import { useCookieConsent } from "@/providers/CookieConsentProvider";
import { XMarkIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function CookieConsentBanner() {
  const {
    showBanner,
    preferences,
    updatePreferences,
    acceptAll,
    rejectAll,
    setShowBanner,
  } = useCookieConsent();

  const [showDetails, setShowDetails] = useState(false);
  const [localPreferences, setLocalPreferences] = useState(preferences);

  // Only show banner if it should be shown
  if (!showBanner) return null;

  const handleSavePreferences = () => {
    updatePreferences(localPreferences);
  };

  const handleAcceptAll = () => {
    // Animate out smoothly before accepting
    const banner = document.querySelector("[data-cookie-banner]");
    if (banner) {
      banner.style.transform = "translateY(100px)";
      banner.style.opacity = "0";
      banner.style.transition = "all 0.5s ease-in-out";

      setTimeout(() => {
        acceptAll();
      }, 500);
    } else {
      acceptAll();
    }
  };

  const handleRejectAll = () => {
    // Animate out smoothly before rejecting
    const banner = document.querySelector("[data-cookie-banner]");
    if (banner) {
      banner.style.transform = "translateY(100px)";
      banner.style.opacity = "0";
      banner.style.transition = "all 0.5s ease-in-out";

      setTimeout(() => {
        rejectAll();
      }, 500);
    } else {
      rejectAll();
    }
  };

  const handleClose = () => {
    // Animate out smoothly before closing
    const banner = document.querySelector("[data-cookie-banner]");
    if (banner) {
      banner.style.transform = "translateY(100px)";
      banner.style.opacity = "0";
      banner.style.transition = "all 0.5s ease-in-out";

      setTimeout(() => {
        setShowBanner(false);
      }, 500);
    } else {
      setShowBanner(false);
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 40,
          }}
          className="fixed bottom-4 right-4 z-[99999] w-[calc(100vw-2rem)] max-w-md sm:max-w-lg"
          data-cookie-banner
        >
          <div className="bg-gray-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
            {/* Single line layout - responsive */}
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              {/* Mobile: Stacked layout */}
              <div className="sm:hidden space-y-3">
                {/* Top row: Icon + text + close */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center relative">
                      <Image
                        src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1756673221/cookie_yukt8p.png"
                        alt="Cookie icon"
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        We use cookies
                      </p>
                      <p className="text-xs text-gray-400">
                        to make your experience smooth
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-300 transition-colors p-1.5 rounded-full hover:bg-gray-800"
                    aria-label="Close cookie banner"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Bottom row: Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleAcceptAll}
                    className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium text-sm"
                  >
                    Accept
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleRejectAll}
                    className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium text-sm"
                  >
                    Reject
                  </motion.button>
                </div>
              </div>

              {/* Desktop: Original horizontal layout */}
              <div className="hidden sm:flex items-center justify-between gap-6">
                {/* Left: Cookie info with icon */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center relative">
                    <Image
                      src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1756673221/cookie_yukt8p.png"
                      alt="Cookie icon"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      We use cookies
                    </p>
                    <p className="text-xs text-gray-400">
                      to make your experience smooth
                    </p>
                  </div>
                </div>

                {/* Middle: Action buttons */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleAcceptAll}
                    className="px-5 py-2 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-colors font-medium text-sm"
                  >
                    Accept
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleRejectAll}
                    className="px-5 py-2 bg-gray-700 text-white rounded-2xl hover:bg-gray-600 transition-colors font-medium text-sm"
                  >
                    Reject
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Detailed Preferences - Expandable Section */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden border-t border-gray-700"
                >
                  <div className="px-6 py-4">
                    <h4 className="text-sm font-medium text-white mb-3">
                      Cookie Categories
                    </h4>

                    <div className="space-y-2">
                      {/* Essential Cookies */}
                      <div className="flex items-center justify-between p-2.5 bg-gray-800 rounded-xl">
                        <div className="flex-1">
                          <h5 className="font-medium text-white text-sm">
                            Essential
                          </h5>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Required for functionality
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={localPreferences.essential}
                          disabled
                          className="h-4 w-4 text-orange-500 border-gray-600 rounded"
                        />
                      </div>

                      {/* Analytics Cookies */}
                      <div className="flex items-center justify-between p-2.5 bg-gray-800 rounded-xl">
                        <div className="flex-1">
                          <h5 className="font-medium text-white text-sm">
                            Analytics
                          </h5>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Help improve our services
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={localPreferences.analytics}
                          onChange={(e) =>
                            setLocalPreferences((prev) => ({
                              ...prev,
                              analytics: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 text-orange-500 border-gray-600 rounded"
                        />
                      </div>

                      {/* Functional Cookies */}
                      <div className="flex items-center justify-between p-2.5 bg-gray-800 rounded-xl">
                        <div className="flex-1">
                          <h5 className="font-medium text-white text-sm">
                            Functional
                          </h5>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Remember preferences
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={localPreferences.functional}
                          onChange={(e) =>
                            setLocalPreferences((prev) => ({
                              ...prev,
                              functional: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 text-orange-500 border-gray-600 rounded"
                        />
                      </div>
                    </div>

                    {/* Save Custom Preferences */}
                    <div className="mt-4 flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleSavePreferences}
                        className="px-5 py-2 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-colors font-medium text-sm"
                      >
                        Save
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
