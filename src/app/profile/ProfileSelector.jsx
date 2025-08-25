"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react"; // ✅ NextAuth.js session
import { PropagateLoader } from "react-spinners";
import {
  UserCircle,
  Ticket,
  CalendarRange,
  Settings,
  LogOut,
  ChevronRight,
  Map,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useRole"; // Add this import at the top with other imports
import WorkCredit from "./WorkCredit";

export default function ProfileSelector() {
  const { data: session, status } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const role = useRole(); // Add this line
  // ✅ Extract user data from session
  const user = session?.user;
  const userName = user?.name || user?.email || "User"; // Show name, fallback to email
  const isGmailUser = user?.provider === "google"; // Add this line to check provider

  // ✅ Memoized menu items
  const menuItems = useMemo(
    () => [
      {
        href: "/profile/my-profile",
        title: "Profile Settings",
        description: "Update your personal information and preferences",
        icon: UserCircle,
        show: !isGmailUser, // Only show if not Gmail user
      },

      {
        href: "/profile/my-tickets",
        title: "My Tickets",
        description: "View and manage your event tickets",
        icon: Ticket,
        show: true,
      },
      {
        href: "/events/manager",
        title: "Event Management",
        description: "Create and manage your events",
        icon: CalendarRange,
        show: role === "host" || role === "admin",
      },
      {
        href: "/admin",
        title: "Admin Dashboard",
        description: "Access administrative controls and settings",
        icon: Settings,
        show: role === "admin",
      },
    ],
    [role, isGmailUser] // Add isGmailUser to dependencies
  );

  // ✅ Handle sign-out
  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut({ callbackUrl: "/auth" }); // Redirect after sign-out
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setSigningOut(false);
    }
  };

  // ✅ If user is not logged in, show a fallback state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PropagateLoader size={10} color="#FF6600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <UserCircle className="w-16 h-16 text-orange-600" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Please Sign In
          </h2>
          <p className="text-gray-600 mb-10 text-lg">
            Sign in to access your profile and bookings.
          </p>
          <Link
            href="/auth"
            className="inline-block px-10 py-4 bg-orange-500 text-white text-lg font-medium rounded-xl hover:bg-orange-600 transition duration-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-16 ">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3">
            Welcome, <br /> {userName}
          </h1>
          <p className="text-base text-gray-600">
            Manage your account and experiences
          </p>
        </div>
        <WorkCredit userEmail={user?.email} />

        {/* Menu items grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {menuItems.map(
            (item) =>
              item.show && (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 opacity-10 group-hover:opacity-20 transition-opacity" />
                  <div className="relative flex items-center">
                    <div className="flex-shrink-0">
                      <item.icon className="h-10 w-10 text-orange-600" />
                    </div>
                    <div className="ml-6 flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </Link>
              )
          )}
        </div>

        {/* Sign-out Button */}
        <div className="mt-12 text-center">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex items-center px-8 py-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors duration-300"
          >
            {signingOut ? (
              <PropagateLoader size={6} color="#777" />
            ) : (
              <>
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
