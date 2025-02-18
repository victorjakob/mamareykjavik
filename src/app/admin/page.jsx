"use client";

import Link from "next/link";
import {
  PlusCircle,
  CalendarRange,
  Users,
  Coffee,
  ShoppingBag,
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
            Admin Dashboard
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to your command center. Manage events, users, and more from
            one central location.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/create-event"
            className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative flex items-center">
              <PlusCircle className="h-10 w-10 text-indigo-600" />
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  Create New Event
                </h2>
                <p className="mt-2 text-gray-600">
                  Launch a new event with comprehensive details, scheduling, and
                  pricing options
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/manage-events"
            className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative flex items-center">
              <CalendarRange className="h-10 w-10 text-purple-600" />
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  Manage Events
                </h2>
                <p className="mt-2 text-gray-600">
                  Overview and control of all the events in one place
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/manage-users"
            className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative flex items-center">
              <Users className="h-10 w-10 text-blue-600" />
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Manage Users
                </h2>
                <p className="mt-2 text-gray-600">
                  Oversee user accounts, permissions, and engagement
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/manage-menu"
            className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative flex items-center">
              <Coffee className="h-10 w-10 text-emerald-600" />
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  Manage Menu
                </h2>
                <p className="mt-2 text-gray-600">
                  Curate and update your menu offerings and pricing
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/manage-store"
            className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative flex items-center">
              <ShoppingBag className="h-10 w-10 text-pink-600" />
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                  Manage Store
                </h2>
                <p className="mt-2 text-gray-600">
                  Manage your store inventory and product listings
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
