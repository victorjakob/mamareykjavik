"use client";

import { useRole } from "@/hooks/useRole";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import Link from "next/link";

export default function AdminGuard({ children }) {
  const role = useRole();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (role === "guest") {
      router.replace("/auth");
    } else if (role !== "admin" && role !== "host") {
      router.replace("/profile");
    }
    setIsChecking(false);
  }, [role, router]);

  // Show loading state while checking
  if (isChecking) {
    return <LoadingSpinner />;
  }

  // Show unauthorized message if not admin or host
  if (role !== "admin" && role !== "host") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900">
            Admin or Host Access Required
          </h2>
          <p className="text-gray-600">
            You need administrator or host privileges to access this page.
          </p>
          <Link
            href="/profile"
            className="inline-block px-6 py-3 rounded-xl font-medium bg-[#ff914d] text-black hover:scale-105 transition-all duration-200"
          >
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
