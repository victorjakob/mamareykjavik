"use client";

import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function CommentDisplay({ comment }) {
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
        return "border-emerald-300";
      case "declined":
        return "border-rose-300";
      default:
        return "border-amber-300";
    }
  };

  if (!comment) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div
        className={`rounded-xl border-2 ${getStatusColor(
          comment.status
        )} p-4 bg-white`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getStatusIcon(comment.status)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-gray-600">
                {getStatusText(comment.status)}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleDateString("is-IS", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {comment.comment}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

