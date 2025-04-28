"use client";

import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export default function TripCard({ trip, type }) {
  const startTime = new Date(trip.tour_sessions.start_time);
  const isPast = type === "past";

  // Format date and time
  const date = startTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const time = startTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Calculate duration in hours
  const durationHours = Math.round(
    trip.tour_sessions.tours.duration_minutes / 60
  );

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300
        ${isPast ? "opacity-85" : "hover:shadow-lg hover:scale-[1.02]"}
      `}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4A5D23] to-[#8BA663]" />
      <div className="p-6">
        {/* Status Badge */}
        <div className="flex justify-between items-start mb-6">
          <span
            className={`
              px-4 py-1.5 rounded-full text-sm font-medium
              ${
                isPast
                  ? "bg-gray-100 text-gray-600"
                  : "bg-[#4A5D23]/10 text-[#4A5D23]"
              }
            `}
          >
            {isPast ? "Completed" : "Upcoming"}
          </span>
          <span
            className={`
            text-sm font-medium
            ${
              trip.payment_status === "paid"
                ? "text-[#4A5D23]"
                : "text-orange-600"
            }
          `}
          >
            {trip.payment_status === "paid" ? "✓ Paid" : "Pending Payment"}
          </span>
        </div>

        {/* Tour Name */}
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {trip.tour_sessions.tours.name}
        </h3>

        {/* Tour Details */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center text-gray-600">
            <CalendarIcon className="h-5 w-5 mr-3 text-[#4A5D23]" />
            <span>{date}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <ClockIcon className="h-5 w-5 mr-3 text-[#4A5D23]" />
            <span>
              {time} • {durationHours} hours
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <UserGroupIcon className="h-5 w-5 mr-3 text-[#4A5D23]" />
            <span>
              {trip.number_of_tickets}{" "}
              {trip.number_of_tickets === 1 ? "person" : "people"}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPinIcon className="h-5 w-5 mr-3 text-[#4A5D23]" />
            <span>MAMA Restaurant, Bankastræti 2</span>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="text-gray-900">
            <span className="font-medium text-lg">
              {trip.total_amount.toLocaleString()} ISK
            </span>
          </div>
          {!isPast && (
            <button
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#4A5D23]/10 text-[#4A5D23] hover:bg-[#4A5D23]/15 transition-colors duration-200 font-medium text-sm"
              onClick={() =>
                window.open(`/tours/${trip.tour_sessions.tours.id}`, "_blank")
              }
            >
              View Details
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
