"use client";

import Image from "next/image";

export default function TourInfo({ tour }) {
  return (
    <div className="rounded-2xl mx-auto w-full mb-8 relative overflow-hidden  shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Background Image and Content Container */}
      <div className="flex flex-col md:flex-row md:h-48">
        {/* Image Section */}
        <div className="relative w-full md:w-1/3 h-48 md:h-full">
          <Image
            src={tour.image_url}
            alt={`${tour.name} view`}
            fill
            className="object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-t-none"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:bg-gradient-to-r" />
        </div>

        {/* Content Section */}
        <div className="relative w-full md:w-2/3 p-6 md:p-8">
          <div className="flex flex-col h-full">
            {/* Tour Info */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {tour.name}
              </h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2 text-[#ff914d]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">
                    Duration: {tour.duration_minutes / 60} hours
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2 text-[#ff914d]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="font-medium">
                    Max Group Size: {tour.max_capacity} people
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2 text-[#ff914d]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">
                    {tour.price.toLocaleString()} ISK per person
                  </span>
                </div>
              </div>
            </div>

            {/* Tour Description */}
            <p className="text-gray-600 mt-4 line-clamp-2 italic">
              {tour.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
