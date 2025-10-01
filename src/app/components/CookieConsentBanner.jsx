"use client";
import { useState } from "react";
import { useCookieConsent } from "@/providers/CookieConsentProvider";
import { XMarkIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

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
          <div className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
            {/* Single line layout - responsive */}
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              {/* Mobile: Stacked layout */}
              <div className="sm:hidden space-y-3">
                {/* Top row: Icon + text + close */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
                      <img
                        src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1756673221/cookie_yukt8p.png"
                        alt="Cookie icon"
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        We use cookies
                      </p>
                      <p className="text-xs text-gray-500">
                        to make your experience smooth
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100"
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
                    Accept All
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleRejectAll}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    Reject
                  </motion.button>
                </div>

                {/* Customize button - full width */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Cog6ToothIcon className="h-3.5 w-3.5" />
                  <span>
                    {showDetails ? "Hide Details" : "Customize Preferences"}
                  </span>
                </motion.button>

                {/* Legal text - centered */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 leading-tight">
                    By continuing, you agree to our{" "}
                    <a
                      href="/terms"
                      className="text-orange-500 hover:text-orange-600 underline"
                    >
                      Terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="text-orange-500 hover:text-orange-600 underline"
                    >
                      Privacy
                    </a>
                  </p>
                </div>
              </div>

              {/* Desktop: Original horizontal layout */}
              <div className="hidden sm:flex items-center justify-between gap-6">
                {/* Left: Cookie info with icon */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1756673221/cookie_yukt8p.png"
                      alt="Cookie icon"
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      We use cookies
                    </p>
                    <p className="text-xs text-gray-500">
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
                    Accept All
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleRejectAll}
                    className="px-5 py-2 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    Reject
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowDetails(!showDetails)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors font-medium text-sm flex items-center gap-2"
                  >
                    <Cog6ToothIcon className="h-3.5 w-3.5" />
                    <span>{showDetails ? "Hide" : "Customize"}</span>
                  </motion.button>
                </div>

                {/* Right: Legal text */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-gray-500 leading-tight">
                    By continuing, you agree to our{" "}
                    <a
                      href="/terms"
                      className="text-orange-500 hover:text-orange-600 underline"
                    >
                      Terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="text-orange-500 hover:text-orange-600 underline"
                    >
                      Privacy
                    </a>
                  </p>
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
                  className="overflow-hidden border-t border-gray-100"
                >
                  <div className="px-6 py-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Cookie Categories
                    </h4>

                    <div className="space-y-2">
                      {/* Essential Cookies */}
                      <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 text-sm">
                            Essential
                          </h5>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Required for functionality
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={localPreferences.essential}
                          disabled
                          className="h-4 w-4 text-orange-500 border-gray-300 rounded"
                        />
                      </div>

                      {/* Analytics Cookies */}
                      <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 text-sm">
                            Analytics
                          </h5>
                          <p className="text-xs text-gray-500 mt-0.5">
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
                          className="h-4 w-4 text-orange-500 border-gray-300 rounded"
                        />
                      </div>

                      {/* Functional Cookies */}
                      <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 text-sm">
                            Functional
                          </h5>
                          <p className="text-xs text-gray-500 mt-0.5">
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
                          className="h-4 w-4 text-orange-500 border-gray-300 rounded"
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
