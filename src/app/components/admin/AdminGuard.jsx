"use client";

import { useSupabase } from "@/lib/SupabaseProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminGuard({ children }) {
  const { isAdmin, loading, user } = useSupabase();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  console.log("🔍 AdminGuard State ->", { user, isAdmin, loading });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("❌ No user found, redirecting to /auth");
        router.replace("/auth");
      } else if (!isAdmin) {
        console.log("⚠️ User is not an admin, redirecting to /profile");
        router.replace("/profile");
      }
      setIsChecking(false);
    }
  }, [loading, isAdmin, user, router]);

  // Show loading state while either initial loading or checking
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Only render children if user is admin
  return isAdmin ? children : null;
}
