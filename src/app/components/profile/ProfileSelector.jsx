"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PropagateLoader } from "react-spinners";
import {
  UserCircle,
  Ticket,
  CalendarRange,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function ProfileSelector() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (user) {
          setUser(user);

          // Get user profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (!profileError && profileData) {
            setProfile(profileData);
          }

          const { data: roleData, error: roleError } = await supabase
            .from("roles")
            .select("role")
            .eq("user_id", user.id)
            .single();

          if (!roleError && roleData) {
            setIsAdmin(roleData.role === "admin");
          }

          // Check if user is host of any events
          const { data: eventData, error: eventError } = await supabase
            .from("events")
            .select("host")
            .eq("host", user.email);

          if (!eventError && eventData && eventData.length > 0) {
            setIsHost(true);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message || "An error occurred while fetching user data");
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setIsHost(false);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      setIsHost(false);
      setError(null);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error("Error signing out:", err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        role="status"
        aria-label="Loading"
      >
        <PropagateLoader color="#F97316" size={12} aria-hidden="true" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <UserCircle className="w-16 h-16 text-orange-600" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {error ? "We're having trouble connecting" : "Welcome Back"}
          </h2>
          <p className="text-gray-600 mb-10 text-lg">
            {error
              ? "We're experiencing some technical difficulties. Please try again in a few moments."
              : "Please sign in to access your profile and manage your account"}
          </p>
          <Link
            href="/auth"
            className="inline-block px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      href: "/profile/my-profile",
      title: "Profile Settings",
      description: "Update your personal information and preferences",
      icon: UserCircle,
      show: true,
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
      show: isAdmin || isHost,
    },
    {
      href: "/admin",
      title: "Admin Dashboard",
      description: "Access administrative controls and settings",
      icon: Settings,
      show: isAdmin,
    },
  ];
  return (
    <div className="pt-16 sm:pt-20 min-h-screen ">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-16 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-16 text-center">
          <div className="inline-block p-3 sm:p-4 bg-white rounded-full shadow-lg mb-4 sm:mb-6">
            <UserCircle className="w-12 h-12 sm:w-16 sm:h-16 text-orange-600" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-2 sm:mb-4 px-2">
            Welcome, {profile?.name || user.email}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 px-2">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid gap-4 sm:gap-8 sm:grid-cols-2">
          {menuItems.map(
            (item) =>
              item.show && (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  <div className="absolute top-0 left-0 w-1 sm:w-2 h-full bg-gradient-to-b from-orange-500 to-orange-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                  <div className="p-4 sm:p-8">
                    <div className="flex items-center">
                      <div className="p-2 sm:p-3 bg-orange-50 rounded-lg sm:rounded-xl group-hover:bg-orange-100 transition-colors">
                        <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                      </div>
                      <div className="ml-4 sm:ml-6 flex-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                          {item.title}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-orange-600 transform group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              )
          )}
        </div>

        <div className="mt-8 sm:mt-16 text-center">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-gray-700 hover:text-gray-900 bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
