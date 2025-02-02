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
            setIsHost(roleData.role === "host");
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
        <PropagateLoader color="#4F46E5" size={12} aria-hidden="true" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <UserCircle className="w-16 h-16 text-indigo-600 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {error ? "Oops! Something went wrong" : "Welcome Back"}
          </h2>
          <p className="text-gray-600 mb-8">
            {error ||
              "Please sign in to access your profile and manage your account"}
          </p>
          <Link
            href="/auth"
            className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
      description: "View all your event tickets here",
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
    <div className="pt-20 ">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome, {profile?.name || user.email}
          </h1>
          <p className="text-lg text-gray-600">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {menuItems.map(
            (item) =>
              item.show && (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 hover:border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                      <item.icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 ml-4">
                      {item.title}
                    </h2>
                  </div>
                  <p className="text-gray-600">{item.description}</p>
                </Link>
              )
          )}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center px-6 py-3 text-gray-700 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
