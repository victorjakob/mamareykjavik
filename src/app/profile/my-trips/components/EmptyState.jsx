"use client";

import Link from "next/link";
import { MapIcon } from "@heroicons/react/24/outline";

export default function EmptyState() {
  return (
    <div className="max-w-md mx-auto text-center py-8">
      <div className="w-20 h-20 bg-[#ff914d]/10 border border-[#ff914d]/20 rounded-full mx-auto mb-8 flex items-center justify-center">
        <MapIcon className="w-9 h-9 text-[#ff914d]" />
      </div>

      <h3 className="font-cormorant font-light italic text-[#f0ebe3] mb-3" style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>
        Your Adventure Awaits
      </h3>

      <p className="text-[#a09488] text-sm leading-relaxed mb-10 max-w-sm mx-auto">
        You haven&apos;t booked any experiences yet. Explore what&apos;s on and plan your next visit with the Mama team.
      </p>

      <Link
        href="/events"
        className="inline-flex items-center gap-2 px-7 py-3 bg-[#ff914d] text-black text-sm font-semibold rounded-full hover:bg-[#ff914d]/90 transition-colors group"
      >
        Explore Events
        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}
