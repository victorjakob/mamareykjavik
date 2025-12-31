"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChatBubbleLeftIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "../../hooks/useTranslations";

export default function SectionCommentButton({
  section,
  bookingRef,
  comments = [],
  userEmail,
  isAdmin = false,
  onCommentAdded,
  onStatusUpdate,
}) {
  const params = useParams();
  const actualBookingRef = bookingRef || params?.bookingref;
  const { t } = useTranslations();
  
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [isInternal, setIsInternal] = useState(false);

  // Get the latest comment for this section
  const sectionComment = comments
    .filter((c) => c.section === section)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  const hasComment = !!sectionComment;

  const handleSubmit = async (notifyCustomer = false) => {
    if (!comment.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/wl/booking/${actualBookingRef}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            section, 
            comment: comment.trim(),
            notifyCustomer: notifyCustomer,
            isInternal: isInternal && isAdmin, // Only admins can create internal notes
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit comment");
      }

      const data = await response.json();
      setComment("");
      setIsInternal(false);
      setIsOpen(false);
      setShowNotifyModal(false);
      if (onCommentAdded) onCommentAdded(data.comment);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (isAdmin) {
      // For admin, if it's an internal note, don't show notification modal
      if (isInternal) {
        handleSubmit(false);
      } else {
        // Show modal to ask about email notification
        setShowNotifyModal(true);
      }
    } else {
      // For customer, submit directly
      handleSubmit(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return (
          <CheckCircleIcon className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        );
      case "declined":
        return (
          <XCircleIcon className="h-4 w-4 text-rose-500 flex-shrink-0" />
        );
      default:
        return (
          <ClockIcon className="h-4 w-4 text-amber-500 flex-shrink-0" />
        );
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "accepted":
        return "Samþykkt";
      case "declined":
        return "Hafnað";
      default:
        return "Í bið";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "declined":
        return "text-rose-600 bg-rose-50 border-rose-200";
      default:
        return "text-amber-600 bg-amber-50 border-amber-200";
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {hasComment ? t("editComment") : t("addComment")}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitClick} className="p-6 space-y-4">
                {hasComment && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs text-gray-500 mb-1">Fyrri athugasemd:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {sectionComment.comment}
                    </p>
                    {sectionComment.status !== "pending" && (
                      <div className="mt-2 flex items-center gap-1.5">
                        {getStatusIcon(sectionComment.status)}
                        <span className="text-xs text-gray-600">
                          {getStatusText(sectionComment.status)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("commentLabel")}
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t("commentPlaceholder")}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b] focus:border-[#a77d3b] resize-none"
                    required
                  />
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isInternal"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="h-4 w-4 text-[#a77d3b] border-gray-300 rounded focus:ring-[#a77d3b]"
                    />
                    <label
                      htmlFor="isInternal"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {t("internalNote")}
                    </label>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
                    <p className="text-sm text-rose-700">{error}</p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !comment.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#a77d3b] rounded-lg hover:bg-[#a77d3b]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? t("sending") : t("send")}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const notifyModal = (
    <AnimatePresence>
      {showNotifyModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNotifyModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#a77d3b]/10 rounded-lg">
                  <EnvelopeIcon className="h-5 w-5 text-[#a77d3b]" />
                </div>
                <h3 className="text-base font-medium text-gray-900">
                  {t("notifyCustomerChange")}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#a77d3b] rounded-lg hover:bg-[#a77d3b]/90 transition-colors disabled:opacity-50"
                >
                  {t("yes")}
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t("no")}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#a77d3b] hover:bg-[#a77d3b]/90 rounded-lg transition-colors shadow-sm whitespace-nowrap"
      >
        <ChatBubbleLeftIcon className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="hidden sm:inline">{t("sendComment")}</span>
        <span className="sm:hidden">{t("commentLabel")}</span>
      </button>

      {typeof window !== "undefined" && createPortal(modalContent, document.body)}
      {typeof window !== "undefined" && createPortal(notifyModal, document.body)}
    </>
  );
}

