"use client";
import Link from "next/link";

export default function BookRedirect() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-center p-6">
      {/* Title */}
      <h1 className="leading-normal text-4xl font-bold text-gray-800 mb-4">
        Book Your Table at Mama Reykjavik
      </h1>

      {/* Description */}
      <p className="text-lg text-gray-600 mb-8 max-w-lg">
        To book a table at Mama Reykjavik, please use our official reservation
        system through the link below. We look forward to welcoming you!
      </p>

      {/* Booking Link */}
      <Link
        href="https://www.dineout.is/mamareykjavik?isolation=true"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-full transition duration-200 shadow-md"
      >
        Book a Table Now
      </Link>
    </div>
  );
}
