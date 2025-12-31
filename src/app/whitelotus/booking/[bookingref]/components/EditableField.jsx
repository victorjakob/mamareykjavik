"use client";

import { useState } from "react";
import { CheckIcon, XMarkIcon, PlusIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useTranslations } from "../../hooks/useTranslations";

export default function EditableField({
  label,
  value,
  fieldKey,
  bookingRef,
  isAdmin,
  onUpdate,
  pendingApproval,
  approved,
}) {
  const { t } = useTranslations();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [saving, setSaving] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  const handleSave = async (notifyCustomer = false) => {
    if (editValue === value) {
      setEditValue(value);
      setIsEditing(false);
      setShowNotifyModal(false);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/wl/booking/${bookingRef}/field`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: fieldKey,
          value: editValue.trim(),
          notifyCustomer: notifyCustomer,
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      const data = await response.json();
      if (onUpdate) {
        onUpdate(data.booking);
      }
      setIsEditing(false);
      setShowNotifyModal(false);
    } catch (error) {
      console.error("Error updating field:", error);
      alert("Villa kom upp við að uppfæra");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = () => {
    if (isAdmin) {
      // For admin, show modal to ask about email notification
      setShowNotifyModal(true);
    } else {
      // For customer, save directly
      handleSave(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
    setShowNotifyModal(false);
  };

  const notifyModal = (
    <AnimatePresence>
      {showNotifyModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNotifyModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
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
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#a77d3b] rounded-lg hover:bg-[#a77d3b]/90 transition-colors disabled:opacity-50"
                >
                  {t("yes")}
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
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

  if (isEditing) {
    return (
      <>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">{label}</label>
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-[#a77d3b]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/25 focus:border-[#a77d3b] resize-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Escape") handleCancel();
            }}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveClick}
              disabled={saving}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50"
              title="Vista"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
              title={t("cancel")}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        {typeof window !== "undefined" &&
          createPortal(notifyModal, document.body)}
      </>
    );
  }

  const handleApprove = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/wl/booking/${bookingRef}/field`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: fieldKey,
          value: value || "", // Ensure we send a value even if empty
          approve: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Approve failed:", errorData);
        throw new Error(errorData.error || "Failed to approve");
      }

      const data = await response.json();
      
      if (onUpdate && data.booking) {
        onUpdate(data.booking);
      } else {
        console.error("No booking data in response:", data);
        // Force a page refresh if update callback doesn't work
        window.location.reload();
      }
    } catch (error) {
      console.error("Error approving field:", error);
      alert(`Villa kom upp við að samþykkja: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Ertu viss um að þú viljir hafna þessari breytingu?")) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/wl/booking/${bookingRef}/field`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: fieldKey,
          value: "",
          reject: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to reject");

      const data = await response.json();
      if (onUpdate) {
        onUpdate(data.booking);
      }
    } catch (error) {
      console.error("Error rejecting field:", error);
      alert("Villa kom upp við að hafna");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <label className="text-xs font-medium text-gray-600">
          {label}
        </label>
        {pendingApproval && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            Í bið
          </span>
        )}
        {approved && !pendingApproval && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
            Samþykkt
          </span>
        )}
      </div>
      {value ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {value}
          </p>
          {isAdmin && pendingApproval && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleApprove}
                disabled={saving}
                className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                Samþykkja
              </button>
              <button
                onClick={handleReject}
                disabled={saving}
                className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-50"
              >
                Hafna
              </button>
            </div>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-gray-500 hover:text-[#a77d3b] underline"
          >
            Breyta
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1 text-xs font-medium text-[#a77d3b] hover:text-[#a77d3b]/80 hover:underline transition-colors"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          {t("register")}
        </button>
      )}
    </div>
  );
}

