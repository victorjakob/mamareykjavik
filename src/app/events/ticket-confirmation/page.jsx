"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function TicketConfirmation() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <div className="max-w-2xl mx-auto md:mt-16 py-16 px-4">
      <div className="text-center space-y-6">
        <div className="mb-8">
          <svg
            className="w-16 h-16 mx-auto text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">Congratulations!</h1>

        <p className="text-lg text-gray-600">
          Your ticket has been sent to your email address. You can also access
          it anytime through your profile page.
        </p>

        <div className="pt-4 space-y-4">
          <Link
            href={isAuthenticated ? "/profile/my-tickets" : "/auth"}
            className="inline-block bg-gradient-to-r from-[#ff914d] to-orange-600 text-white py-3 px-8 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
          >
            {isAuthenticated ? "View My Tickets" : "Sign In / Register"}
          </Link>

          <div>
            <Link
              href="/events"
              className="inline-block bg-white text-[#ff914d] border-2 border-[#ff914d] py-3 px-8 rounded-xl font-medium hover:bg-[#ff914d] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
            >
              Explore More Events
            </Link>
          </div>
        </div>

        <p className="text-lg text-gray-600 pt-8">
          We look forward to seeing you at the event!
        </p>
      </div>
    </div>
  );
}
