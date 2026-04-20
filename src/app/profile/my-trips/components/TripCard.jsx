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

  const date = startTime.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const time = startTime.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: false,
  });

  const durationHours = Math.round(trip.tour_sessions.tours.duration_minutes / 60);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#1e1610] border transition-all duration-250 ${
      isPast ? "border-white/6 opacity-70" : "border-white/8 hover:border-[#ff914d]/25 hover:bg-[#231c12]"
    }`}>
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-px ${isPast ? "bg-white/8" : "bg-gradient-to-r from-[#ff914d]/40 via-[#ff914d]/20 to-transparent"}`} />

      <div className="p-6">
        {/* Status row */}
        <div className="flex items-center justify-between mb-5">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            isPast ? "bg-white/8 text-[#a09488]" : "bg-[#ff914d]/12 text-[#ff914d]"
          }`}>
            {isPast ? "Completed" : "Upcoming"}
          </span>
          <span className={`text-xs font-medium ${
            trip.payment_status === "paid" ? "text-[#ff914d]" : "text-[#a09488]"
          }`}>
            {trip.payment_status === "paid" ? "✓ Paid" : "Pending Payment"}
          </span>
        </div>

        {/* Tour name */}
        <h3 className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-5" style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.7rem)" }}>
          {trip.tour_sessions.tours.name}
        </h3>

        {/* Details */}
        <div className="space-y-2.5 mb-5">
          {[
            { icon: CalendarIcon, text: date },
            { icon: ClockIcon, text: `${time} · ${durationHours} hours` },
            { icon: UserGroupIcon, text: `${trip.number_of_tickets} ${trip.number_of_tickets === 1 ? "person" : "people"}` },
            { icon: MapPinIcon, text: "MAMA Restaurant, Bankastræti 2" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-[#a09488] text-sm">
              <Icon className="h-4 w-4 text-[#ff914d]/50 flex-shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Price + action */}
        <div className="flex items-center justify-between pt-4 border-t border-white/8">
          <span className="font-cormorant font-light text-[#f0ebe3]" style={{ fontSize: "1.4rem" }}>
            {trip.total_amount.toLocaleString()} ISK
          </span>
          {!isPast && (
            <button
              onClick={() => window.open(`/tours/${trip.tour_sessions.tours.id}`, "_blank")}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-white/15 text-[#a09488] text-xs rounded-full hover:border-[#ff914d]/40 hover:text-[#ff914d] transition-all duration-200"
            >
              View Details
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
