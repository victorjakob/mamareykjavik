"use client";

import TripCard from "./TripCard";

export default function TripList({ trips, type }) {
  return (
    <div className="flex justify-center w-full px-4">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 place-items-center">
          {trips.map((trip) => (
            <div className="w-full max-w-md" key={trip.id}>
              <TripCard trip={trip} type={type} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
