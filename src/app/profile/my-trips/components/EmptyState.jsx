"use client";

import Link from "next/link";
import { MapIcon } from "@heroicons/react/24/outline";

export default function EmptyState() {
  return (
    <div className="relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[#4A5D23]/5 bg-opacity-50 pattern-dots pattern-gray-500 pattern-bg-white pattern-size-2 pattern-opacity-10" />

      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#4A5D23]/10 px-8 py-16 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-[#4A5D23]/10 to-[#8BA663]/10 rounded-full mx-auto mb-8 flex items-center justify-center">
          <MapIcon className="w-10 h-10 text-[#4A5D23]" />
        </div>

        <h3 className="text-2xl font-semibold text-[#4A5D23] mb-4">
          Your Adventure Awaits
        </h3>

        <p className="text-gray-600 text-lg mb-10 max-w-md mx-auto leading-relaxed">
          You haven't booked any tours yet. Discover our trips and create
          unforgettable memories with the Mama team.
        </p>

        <Link
          href="/tours"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-[#4A5D23] text-white hover:bg-[#3A4D13] transition-colors duration-200 font-medium text-base group"
        >
          Explore Available Trips
          <svg
            className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
