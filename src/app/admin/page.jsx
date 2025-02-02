"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen pt-32 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Manage your events and create new ones
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/create-event"
            className="relative block p-8 border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 hover:ring-1 hover:ring-gray-300 transition duration-150 ease-in-out"
          >
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Create New Event
              </h2>
              <p className="mt-4 text-gray-500">
                Add a new event with details like name, description, date, and
                pricing
              </p>
            </div>
          </Link>

          <Link
            href="/admin/manage-events"
            className="relative block p-8 border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 hover:ring-1 hover:ring-gray-300 transition duration-150 ease-in-out"
          >
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Manage Events
              </h2>
              <p className="mt-4 text-gray-500">
                View, edit, or delete existing events
              </p>
            </div>
          </Link>

          <Link
            href="/admin/manage-users"
            className="relative block p-8 border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 hover:ring-1 hover:ring-gray-300 transition duration-150 ease-in-out"
          >
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Manage Users
              </h2>
              <p className="mt-4 text-gray-500">
                View and manage user accounts
              </p>
            </div>
          </Link>
          <Link
            href="/admin/manage-menu"
            className="relative block p-8 border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 hover:ring-1 hover:ring-gray-300 transition duration-150 ease-in-out"
          >
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Manage Menu
              </h2>
              <p className="mt-4 text-gray-500">
                Add, edit, or remove menu items
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
