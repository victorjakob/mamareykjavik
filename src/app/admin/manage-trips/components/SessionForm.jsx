"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function SessionForm({ onSubmit, onClose, tourMaxCapacity }) {
  const [formData, setFormData] = useState({
    start_time: "",
    available_spots: tourMaxCapacity || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      available_spots: parseInt(formData.available_spots),
      start_time: new Date(formData.start_time).toISOString(),
    });
  };

  // Calculate min date-time (now)
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Create New Session
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="start_time"
              className="block text-sm font-medium text-gray-700"
            >
              Start Time
            </label>
            <input
              type="datetime-local"
              id="start_time"
              required
              min={minDateTime}
              value={formData.start_time}
              onChange={(e) =>
                setFormData({ ...formData, start_time: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="available_spots"
              className="block text-sm font-medium text-gray-700"
            >
              Available Spots
            </label>
            <input
              type="number"
              id="available_spots"
              required
              min="1"
              max={tourMaxCapacity}
              value={formData.available_spots}
              onChange={(e) =>
                setFormData({ ...formData, available_spots: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum capacity: {tourMaxCapacity}
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Create Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
