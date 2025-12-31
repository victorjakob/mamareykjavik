"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function AdminCommentManager({
  comment,
  bookingRef,
  onStatusUpdate,
}) {
  const params = useParams();
  const actualBookingRef = bookingRef || params?.bookingref;
  const [updating, setUpdating] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [responseText, setResponseText] = useState("");

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const response = await fetch(
        `/api/wl/booking/${actualBookingRef}/comment/${comment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            status: newStatus,
            adminResponse: responseText.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update comment status");
      }

      const data = await response.json();
      if (onStatusUpdate) onStatusUpdate(data.comment);
      setShowResponse(false);
      setResponseText("");
    } catch (error) {
      console.error("Error updating comment status:", error);
      alert("Villa kom upp við að uppfæra stöðu");
    } finally {
      setUpdating(false);
    }
  };

  if (comment.status !== "pending") {
    return null; // Status is shown in CommentsList
  }

  return (
    <>
      {!showResponse ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResponse(true)}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Bæta við svari
          </button>
          <span className="text-xs text-gray-300">•</span>
          <button
            onClick={() => handleStatusUpdate("accepted")}
            disabled={updating}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            <CheckCircleIcon className="h-3.5 w-3.5" />
            Samþykkja
          </button>
          <button
            onClick={() => handleStatusUpdate("declined")}
            disabled={updating}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-50"
          >
            <XCircleIcon className="h-3.5 w-3.5" />
            Hafna
          </button>
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Skrifaðu svar hér..."
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b] focus:border-[#a77d3b] resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowResponse(false);
                setResponseText("");
              }}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Hætta við
            </button>
            <button
              onClick={() => handleStatusUpdate("accepted")}
              disabled={updating || !responseText.trim()}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              <CheckCircleIcon className="h-3.5 w-3.5" />
              Samþykkja með svari
            </button>
            <button
              onClick={() => handleStatusUpdate("declined")}
              disabled={updating || !responseText.trim()}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-50"
            >
              <XCircleIcon className="h-3.5 w-3.5" />
              Hafna með svari
            </button>
          </div>
        </div>
      )}
    </>
  );
}

