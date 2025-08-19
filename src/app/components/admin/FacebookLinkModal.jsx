"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function FacebookLinkModal({
  isOpen,
  onClose,
  eventName,
  currentFacebookLink,
  onSave,
}) {
  const [facebookLink, setFacebookLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFacebookLink(currentFacebookLink || "");
      setError("");
    }
  }, [isOpen, currentFacebookLink]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validate URL format
      if (facebookLink && !isValidFacebookUrl(facebookLink)) {
        setError("Please enter a valid Facebook URL");
        setIsSubmitting(false);
        return;
      }

      await onSave(facebookLink);
      onClose();
    } catch (error) {
      setError(error.message || "Failed to save Facebook link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!currentFacebookLink) return;

    setIsSubmitting(true);
    try {
      await onSave(null);
      onClose();
    } catch (error) {
      setError(error.message || "Failed to remove Facebook link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidFacebookUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.hostname.includes("facebook.com") ||
        urlObj.hostname.includes("fb.com") ||
        urlObj.hostname.includes("fb.me")
      );
    } catch {
      return false;
    }
  };

  const openFacebookLink = () => {
    if (currentFacebookLink) {
      window.open(currentFacebookLink, "_blank");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Facebook Link
                </h3>
                <p className="text-sm text-gray-500">{eventName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Current Link Display */}
          {currentFacebookLink && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Current Facebook Link
                  </p>
                  <p className="text-sm text-blue-600 truncate">
                    {currentFacebookLink}
                  </p>
                </div>
                <button
                  onClick={openFacebookLink}
                  className="ml-3 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                >
                  Open
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="facebookLink"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Facebook Event URL
              </label>
              <input
                type="url"
                id="facebookLink"
                value={facebookLink}
                onChange={(e) => setFacebookLink(e.target.value)}
                placeholder="https://www.facebook.com/events/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Paste the Facebook event URL here. Leave empty to remove the
                link.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {currentFacebookLink && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  Remove Link
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Link"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
