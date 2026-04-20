"use client";

import { X, Check, XCircle, Trash2, Copy, ExternalLink, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingDetailsModal({ booking, isOpen, onClose, onBookingUpdated }) {
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
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
    }
    const [, year, month, day] = dateMatch;
    const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    return date.toLocaleDateString("en-US", {
      weekday: "short", year: "numeric", month: "short", day: "numeric", timeZone: "UTC",
    });
  };

  const handleConfirm = async () => {
    setIsConfirming(true); setError(""); setSuccessMessage("");
    try {
      const response = await fetch(`/api/wl/booking/${booking.reference_id}/confirm`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to confirm booking");
      setSuccessMessage("Booking confirmed successfully");
      if (onBookingUpdated) onBookingUpdated();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true); setError(""); setSuccessMessage("");
    try {
      const response = await fetch(`/api/wl/booking/${booking.reference_id}/cancel`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to cancel booking");
      setSuccessMessage("Booking cancelled successfully");
      if (onBookingUpdated) onBookingUpdated();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true); setError(""); setSuccessMessage("");
    try {
      const response = await fetch(`/api/wl/booking/${booking.reference_id}/delete`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete booking");
      setSuccessMessage("Booking deleted successfully");
      if (onBookingUpdated) onBookingUpdated();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCopyUrl = async () => {
    setIsCopying(true); setError(""); setSuccessMessage("");
    try {
      const url = `${window.location.origin}/whitelotus/booking/${booking.reference_id}`;
      await navigator.clipboard.writeText(url);
      setSuccessMessage("URL copied to clipboard");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      setError("Failed to copy URL to clipboard");
    } finally {
      setIsCopying(false);
    }
  };

  const handleClose = () => {
    setError(""); setSuccessMessage(""); setShowDeleteConfirm(false);
    onClose();
  };

  // Light button styles
  const btnGhost = "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all";
  const btnGhostStyle = { background: "#faf6f2", border: "1px solid #e8ddd3", color: "#9a7a62" };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
              style={{
                background: "#ffffff",
                border: "1.5px solid #f0e6d8",
                boxShadow: "0 40px 80px rgba(0,0,0,0.12)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-[1.5px] shrink-0"
                style={{ background: "linear-gradient(to right, rgba(255,145,77,0.5), transparent 60%)" }} />

              {/* Header */}
              <div className="px-6 py-5 flex-shrink-0" style={{ borderBottom: "1px solid #e8ddd3" }}>
                <div className="flex items-center justify-between">
                  <h2 className="font-cormorant italic text-[#2c1810] text-2xl font-light">Booking Details</h2>
                  <button onClick={handleClose}
                    className="p-1.5 rounded-lg transition-colors text-[#9a7a62] hover:text-[#ff914d]"
                    style={{ background: "rgba(255,145,77,0.05)" }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 px-6 py-6">
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-5 rounded-xl px-4 py-3 text-sm text-[#ff8080]"
                    style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.15)" }}>
                    {error}
                  </motion.div>
                )}
                {successMessage && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-5 rounded-xl px-4 py-3 text-sm text-[#ff914d]"
                    style={{ background: "rgba(255,145,77,0.08)", border: "1px solid rgba(255,145,77,0.2)" }}>
                    {successMessage}
                  </motion.div>
                )}

                <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                  {/* Left — Contact */}
                  <div className="flex-1 space-y-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a7a62] mb-1">Name</p>
                      <p className="text-[#2c1810] font-light">{booking.contact_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a7a62] mb-1">Email</p>
                      <a href={`mailto:${booking.contact_email}`}
                        className="text-[#ff914d] hover:text-[#ffb06a] transition-colors font-light text-sm">
                        {booking.contact_email}
                      </a>
                    </div>
                    {booking.contact_company && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a7a62] mb-1">Company</p>
                        <p className="text-[#2c1810] font-light">{booking.contact_company}</p>
                      </div>
                    )}
                    {booking.status && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a7a62] mb-1">Status</p>
                        <span className="rounded-full px-3 py-1 text-xs font-medium capitalize"
                          style={
                            booking.status === "confirmed"
                              ? { background: "rgba(255,145,77,0.15)", color: "#ff914d", border: "1px solid rgba(255,145,77,0.3)" }
                              : booking.status === "cancelled"
                              ? { background: "rgba(255,255,255,0.05)", color: "#5a4a40", border: "1px solid rgba(255,255,255,0.08)" }
                              : { background: "rgba(255,200,77,0.12)", color: "#ffcc4d", border: "1px solid rgba(255,200,77,0.25)" }
                          }>
                          {booking.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right — Date/Time */}
                  <div className="flex-1 space-y-5">
                    {booking.preferred_datetime && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a7a62] mb-1">Date</p>
                        <p className="text-[#2c1810] font-light">{formatDate(booking.preferred_datetime)}</p>
                      </div>
                    )}
                    {booking.start_time && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a7a62] mb-1">Start time</p>
                        <p className="text-[#2c1810] font-light">{booking.start_time}</p>
                      </div>
                    )}
                    {booking.end_time && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a7a62] mb-1">End time</p>
                        <p className="text-[#2c1810] font-light">{booking.end_time}</p>
                      </div>
                    )}
                    {booking.reference_id && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a7a62] mb-1">Reference</p>
                        <p className="text-[#9a7a62] text-xs font-mono">{booking.reference_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-5 flex-shrink-0 relative" style={{ borderTop: "1px solid #e8ddd3" }}>

                {/* Delete — bottom right */}
                <div className="absolute bottom-5 right-6">
                  {!showDeleteConfirm ? (
                    <button onClick={() => setShowDeleteConfirm(true)}
                      className="p-2 rounded-full transition-all text-[#3a2812] hover:text-[#ff8080]"
                      title="Delete booking">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#ff8080]">Delete?</span>
                      <button onClick={handleDelete} disabled={isDeleting}
                        className="p-2 rounded-full transition-colors disabled:opacity-50"
                        style={{ background: "rgba(255,107,107,0.2)", color: "#ff8080" }}>
                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => setShowDeleteConfirm(false)}
                        className="p-2 rounded-full transition-colors"
                        style={{ background: "#241809", color: "#7a6a5a" }}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 pr-20">
                  {booking.status !== "confirmed" && booking.status !== "cancelled" && (
                    <button onClick={handleConfirm} disabled={isConfirming}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all disabled:opacity-50"
                      style={{ background: "#ff914d", color: "#000" }}>
                      {isConfirming ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Confirming…</> : <><Check className="w-3.5 h-3.5" />Confirm</>}
                    </button>
                  )}
                  {booking.status !== "cancelled" && (
                    <button onClick={handleCancel} disabled={isCancelling}
                      className={`${btnGhost} disabled:opacity-50`} style={btnGhostStyle}>
                      {isCancelling ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Cancelling…</> : <><XCircle className="w-3.5 h-3.5" />Cancel</>}
                    </button>
                  )}
                  <button onClick={handleCopyUrl} disabled={isCopying}
                    className={`${btnGhost} disabled:opacity-50`} style={btnGhostStyle}>
                    {isCopying ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Copying…</> : <><Copy className="w-3.5 h-3.5" />Copy URL</>}
                  </button>
                  <button onClick={() => window.open(`/whitelotus/booking/${booking.reference_id}`, "_blank")}
                    className={btnGhost} style={btnGhostStyle}>
                    <ExternalLink className="w-3.5 h-3.5" /> View page
                  </button>
                  <button onClick={() => window.open(`/whitelotus/booking/admin/${booking.reference_id}`, "_blank")}
                    className={btnGhost} style={btnGhostStyle}>
                    <ExternalLink className="w-3.5 h-3.5" /> Admin intake
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
