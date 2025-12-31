"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit3, Send, Loader2 } from "lucide-react";

export default function FacebookPostModal({
  isOpen,
  onClose,
  eventData,
  onPost,
}) {
  const [postText, setPostText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const generatePost = useCallback(async () => {
    if (!eventData) return;

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/events/generateFacebookPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventTitle: eventData.eventTitle,
          eventDescription: eventData.eventDescription,
          eventDate: eventData.eventDate,
          eventUrl: eventData.eventUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPostText(data.generatedPost);
      } else {
        setError(data.error || "Failed to generate post");
      }
    } catch (err) {
      setError("Network error while generating post");
    } finally {
      setIsGenerating(false);
    }
  }, [eventData]);

  // Generate AI post when modal opens
  useEffect(() => {
    if (isOpen && eventData) {
      // Clear previous content when modal opens with new event data
      setPostText("");
      setError("");
      setIsEditing(false);
      generatePost();
    }
  }, [isOpen, eventData, generatePost]);

  const handlePost = async () => {
    if (!postText.trim()) return;

    setIsPosting(true);
    setError("");

    try {
      const response = await fetch("/api/events/postEventToFacebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventTitle: eventData.eventTitle,
          eventDescription: eventData.eventDescription,
          eventDate: eventData.eventDate,
          eventImage: eventData.eventImage,
          eventUrl: eventData.eventUrl,
          customPostText: postText, // Pass the custom text
        }),
      });

      const data = await response.json();

      if (data.success) {
        onPost(data);
        onClose();
      } else {
        setError(data.error || "Failed to post to Facebook");
      }
    } catch (err) {
      setError("Network error while posting");
    } finally {
      setIsPosting(false);
    }
  };

  const handleClose = () => {
    setPostText("");
    setError("");
    setIsEditing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 md:w-6 md:h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h2 className="text-base md:text-xl font-semibold text-gray-900 truncate">
                  Share on Facebook
                </h2>
                <p className="text-xs md:text-sm text-gray-500 hidden md:block">
                  Preview and edit your post
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 ml-2"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Event Info */}
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">
                {eventData?.eventTitle}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">
                {eventData?.eventDescription}
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                {eventData?.eventDate &&
                  new Date(eventData.eventDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </p>
            </div>

            {/* Post Text */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Post Content
                </label>
                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  {isGenerating && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </div>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your Facebook post content..."
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {postText.length}/200 characters
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 min-h-[80px]">
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-16">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {postText}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Character Count Warning */}
            {postText.length > 200 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-700">
                  Post is {postText.length - 200} characters over the
                  recommended limit.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 md:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              onClick={generatePost}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 order-2 md:order-1"
            >
              <Loader2
                className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Regenerate</span>
              <span className="sm:hidden">Regen</span>
            </button>
            <div className="flex gap-2 md:gap-3 order-1 md:order-2">
              <button
                onClick={handleClose}
                className="flex-1 md:flex-none px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={!postText.trim() || isPosting}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Posting...</span>
                    <span className="sm:hidden">Posting</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Post to Facebook</span>
                    <span className="sm:hidden">Post</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
