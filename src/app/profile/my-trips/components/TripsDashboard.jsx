"use client";

import TripList from "./TripList";
import EmptyState from "./EmptyState";

export default function TripsDashboard({ upcomingTrips, pastTrips }) {
  const hasUpcoming = upcomingTrips.length > 0;
  const hasPast = pastTrips.length > 0;

  if (!hasUpcoming && !hasPast) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-16 flex flex-col items-center w-full">

      {/* Upcoming */}
      <section className="relative w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
            <span className="text-[10px] uppercase tracking-[0.45em] text-[#ff914d]">On the horizon</span>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
          </div>
          <h2 className="font-cormorant font-light italic text-[#f0ebe3] text-center" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
            Upcoming Adventures
          </h2>
          {hasUpcoming && (
            <p className="text-[#a09488] text-xs tracking-wide mt-1.5">
              Your next {upcomingTrips.length} adventure{upcomingTrips.length > 1 ? "s" : ""} await
            </p>
          )}
        </div>

        {hasUpcoming ? (
          <TripList trips={upcomingTrips} type="upcoming" />
        ) : (
          <div className="max-w-2xl mx-auto bg-[#1e1610] border border-white/8 rounded-2xl p-8 text-center">
            <p className="text-[#a09488] text-sm italic">No upcoming adventures. Time to plan your next journey!</p>
          </div>
        )}
      </section>

      {/* Ornament divider */}
      <div className="flex flex-col items-center gap-0">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/10" />
        <div className="w-px h-5 bg-gradient-to-b from-white/10 to-[#ff914d]/30" />
        <div className="w-1 h-1 rounded-full bg-[#ff914d]/40 mt-0.5" />
      </div>

      {/* Past */}
      <section className="relative w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-white/20" />
            <span className="text-[10px] uppercase tracking-[0.45em] text-[#a09488]">Memories</span>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-white/20" />
          </div>
          <h2 className="font-cormorant font-light italic text-[#a09488] text-center" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
            Past Adventures
          </h2>
          {hasPast && (
            <p className="text-[#5a4a3a] text-xs tracking-wide mt-1.5">
              {pastTrips.length} cherished memor{pastTrips.length > 1 ? "ies" : "y"} with MAMA
            </p>
          )}
        </div>

        {hasPast ? (
          <TripList trips={pastTrips} type="past" />
        ) : (
          <div className="max-w-2xl mx-auto bg-[#1e1610] border border-white/8 rounded-2xl p-8 text-center">
            <p className="text-[#a09488] text-sm italic">Your adventure history will appear here</p>
          </div>
        )}
      </section>

    </div>
  );
}
