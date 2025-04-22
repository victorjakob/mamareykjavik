"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";

export default function BookingSummary({
  bookingData,
  tour,
  sessions,
  onBack,
  onSubmit,
  loading,
}) {
  // Find the selected session
  const selectedSession = sessions.find(
    (session) => session.id === bookingData.dateTime
  );

  const formatDate = (dateString) => {
    if (!dateString) return "Not selected";
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Not selected";
    return format(new Date(timeString), "h:mm a");
  };

  const calculateTotal = () => {
    return bookingData.numberOfPeople * tour.price;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Booking Summary
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Tour Details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Tour Name</p>
                <p className="font-medium">{tour.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {formatDate(selectedSession?.start_time)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">
                  {formatTime(selectedSession?.start_time)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Number of People</p>
                <p className="font-medium">{bookingData.numberOfPeople}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price per Person</p>
                <p className="font-medium">{tour.price} ISK</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="font-medium text-[#ff914d]">
                  {calculateTotal()} ISK
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{bookingData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{bookingData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{bookingData.phone}</p>
              </div>
            </div>
          </div>

          {bookingData.specialRequests && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Special Requests
              </h3>
              <p className="text-gray-700">{bookingData.specialRequests}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d]"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#ff914d] hover:bg-[#e67f3d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            "Confirm Booking"
          )}
        </button>
      </div>
    </motion.div>
  );
}
