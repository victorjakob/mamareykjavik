"use client";

import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function CommentsList({
  comments,
  isAdmin,
  bookingRef,
  onStatusUpdate,
  AdminCommentManager,
}) {
  if (!comments || comments.length === 0) return null;

  // Separate regular comments and internal notes
  const regularComments = comments.filter((c) => !c.is_internal);
  const internalNotes = isAdmin ? comments.filter((c) => c.is_internal) : [];

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return (
          <CheckCircleIcon className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        );
      case "declined":
        return <XCircleIcon className="h-4 w-4 text-rose-500 flex-shrink-0" />;
      default:
        return <ClockIcon className="h-4 w-4 text-amber-500 flex-shrink-0" />;
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

  const getCommentBg = (status) => {
    switch (status) {
      case "accepted":
        return "bg-emerald-50/50";
      case "declined":
        return "bg-rose-50/50";
      default:
        return "bg-white";
    }
  };

  const renderComment = (comment, index, isInternal = false) => (
    <div key={comment.id}>
      <div
        className={`rounded-lg p-3 ${
          isInternal
            ? "bg-blue-50/50 border border-blue-200"
            : getCommentBg(comment.status)
        }`}
      >
        <div className="flex items-start gap-3">
          {isInternal ? (
            <div className="flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                Innri
              </span>
            </div>
          ) : (
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(comment.status)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                {!isInternal && (
                  <>
                    <span className="text-xs font-medium text-gray-600">
                      {getStatusText(comment.status)}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                  </>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString("is-IS", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              {isAdmin &&
                !isInternal &&
                comment.status === "pending" &&
                AdminCommentManager && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <AdminCommentManager
                      comment={comment}
                      bookingRef={bookingRef}
                      onStatusUpdate={onStatusUpdate}
                    />
                  </div>
                )}
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {comment.comment}
            </p>
            {comment.admin_response && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-3">
                  <p className="text-xs font-medium text-gray-500 flex-shrink-0">
                    Svar:
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed flex-1">
                    {comment.admin_response}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {index <
        (isInternal ? internalNotes.length : regularComments.length) - 1 && (
        <div className="mt-3" />
      )}
    </div>
  );

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
      {/* Regular Comments */}
      {regularComments.length > 0 && (
        <div className="rounded-xl border-2 border-[#a77d3b] p-4 bg-white">
          <div className="space-y-3">
            {regularComments.map((comment, index) =>
              renderComment(comment, index, false)
            )}
          </div>
        </div>
      )}

      {/* Internal Notes (Admin Only) */}
      {internalNotes.length > 0 && (
        <div className="rounded-xl border-2 border-blue-300 p-4 bg-blue-50/30">
          <div className="mb-3 pb-2 border-b border-blue-200">
            <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">
              Innri athugasemdir
            </p>
          </div>
          <div className="space-y-3">
            {internalNotes.map((comment, index) =>
              renderComment(comment, index, true)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
