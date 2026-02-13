"use client";

import {
  X,
  Check,
  XCircle,
  Trash2,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onBookingUpdated,
}) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!booking) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    // Parse date string directly to avoid timezone conversion
    // Extract date part from ISO string (YYYY-MM-DD)
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) {
      // Fallback to regular parsing if format is different
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    
    const [, year, month, day] = dateMatch;
    const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/wl/booking/${booking.reference_id}/confirm`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to confirm booking");
      }

      setSuccessMessage("Booking confirmed successfully");
      if (onBookingUpdated) {
        onBookingUpdated();
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/wl/booking/${booking.reference_id}/cancel`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      setSuccessMessage("Booking cancelled successfully");
      if (onBookingUpdated) {
        onBookingUpdated();
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/wl/booking/${booking.reference_id}/delete`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete booking");
      }

      setSuccessMessage("Booking deleted successfully");
      if (onBookingUpdated) {
        onBookingUpdated();
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCopyUrl = async () => {
    setIsCopying(true);
    setError("");
    setSuccessMessage("");

    try {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/whitelotus/booking/${booking.reference_id}`;

      await navigator.clipboard.writeText(url);
      setSuccessMessage("URL copied to clipboard");

      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    } catch (err) {
      setError("Failed to copy URL to clipboard");
    } finally {
      setIsCopying(false);
    }
  };

  const handleOpenBookingPage = () => {
    const url = `/whitelotus/booking/${booking.reference_id}`;
    window.open(url, "_blank");
  };

  const handleOpenAdminIntake = () => {
    const url = `/whitelotus/booking/admin/${booking.reference_id}`;
    window.open(url, "_blank");
  };

  const handleClose = () => {
    setError("");
    setSuccessMessage("");
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-light text-gray-900">
                    Booking Details
                  </h2>
                  <button
                    onClick={handleClose}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto flex-1 px-6 py-8">
                {/* Messages */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-700"
                  >
                    {error}
                  </motion.div>
                )}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700"
                  >
                    {successMessage}
                  </motion.div>
                )}

                {/* Information Display - Centered on mobile, side-by-side on desktop */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-center gap-8 md:gap-12">
                  {/* Left Column - Contact Info */}
                  <div className="flex-1 space-y-5 text-center md:text-left">
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">
                        Name
                      </p>
                      <p className="text-base text-gray-900 font-light">
                        {booking.contact_name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">
                        Email
                      </p>
                      <a
                        href={`mailto:${booking.contact_email}`}
                        className="text-base text-[#a77d3b] hover:text-[#8b6a2f] transition-colors font-light"
                      >
                        {booking.contact_email}
                      </a>
                    </div>

                    {booking.contact_company && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">
                          Company
                        </p>
                        <p className="text-base text-gray-900 font-light">
                          {booking.contact_company}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Date & Time */}
                  <div className="flex-1 space-y-5 text-center md:text-left">
                    {booking.preferred_datetime && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">
                          Date
                        </p>
                        <p className="text-base text-gray-900 font-light">
                          {formatDate(booking.preferred_datetime)}
                        </p>
                      </div>
                    )}

                    {booking.start_time && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">
                          Start Time
                        </p>
                        <p className="text-base text-gray-900 font-light">
                          {booking.start_time}
                        </p>
                      </div>
                    )}

                    {booking.end_time && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">
                          End Time
                        </p>
                        <p className="text-base text-gray-900 font-light">
                          {booking.end_time}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer with Actions */}
              <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 flex-shrink-0 relative">
                {/* Delete Button - Bottom Right Corner */}
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="absolute bottom-5 right-6 p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                    title="Delete booking"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="absolute bottom-5 right-6 flex items-center gap-2">
                    <span className="text-xs text-rose-600 font-medium">
                      Delete?
                    </span>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="p-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Action Buttons - Centered */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {/* Confirm Button */}
                  {booking.status !== "confirmed" && booking.status !== "cancelled" && (
                    <button
                      onClick={handleConfirm}
                      disabled={isConfirming}
                      className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-light"
                    >
                      {isConfirming ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Confirming...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Confirm</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Cancel Button */}
                  {booking.status !== "cancelled" && (
                    <button
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-light"
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Cancel</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Copy URL Button */}
                  <button
                    onClick={handleCopyUrl}
                    disabled={isCopying}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-light"
                  >
                    {isCopying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Copying...</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  {/* Open Booking Page Button */}
                  <button
                    onClick={handleOpenBookingPage}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-light"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Page</span>
                  </button>

                  {/* Open Admin Intake Button */}
                  <button
                    onClick={handleOpenAdminIntake}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-light"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Admin intake</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
