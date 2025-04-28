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
      {/* Upcoming Trips Section */}
      <section className="relative w-full">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#4A5D23] text-center">
            Upcoming Adventures
          </h2>
          {hasUpcoming && (
            <p className="text-gray-600 mt-2 text-center">
              Your next {upcomingTrips.length} adventure
              {upcomingTrips.length > 1 ? "s" : ""} await
            </p>
          )}
          <div className="w-32 h-1 bg-gradient-to-r from-[#4A5D23]/20 to-transparent mt-4" />
        </div>
        {hasUpcoming ? (
          <TripList trips={upcomingTrips} type="upcoming" />
        ) : (
          <div className="max-w-2xl mx-auto bg-white/50 rounded-lg p-8 text-center border border-[#4A5D23]/10">
            <p className="text-gray-600 italic">
              No upcoming adventures. Time to plan your next journey!
            </p>
          </div>
        )}
      </section>

      {/* Past Trips Section */}
      <section className="relative w-full">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#4A5D23] text-center">
            Past Adventures
          </h2>
          {hasPast && (
            <p className="text-gray-600 mt-2 text-center">
              {pastTrips.length} cherished memor
              {pastTrips.length > 1 ? "ies" : "y"} with MAMA
            </p>
          )}
          <div className="w-32 h-1 bg-gradient-to-r from-[#4A5D23]/20 to-transparent mt-4" />
        </div>
        {hasPast ? (
          <TripList trips={pastTrips} type="past" />
        ) : (
          <div className="max-w-2xl mx-auto bg-white/50 rounded-lg p-8 text-center border border-[#4A5D23]/10">
            <p className="text-gray-600 italic">
              Your adventure history will appear here
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
