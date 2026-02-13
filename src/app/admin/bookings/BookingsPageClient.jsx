"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Users } from "lucide-react";
import BookingsTable from "./components/BookingsTable";
import BookingDetailsModal from "./components/BookingDetailsModal";

export default function BookingsPageClient({ initialBookings }) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookingsUpdated = async () => {
    // Refresh the page data by refetching
    try {
      const response = await fetch("/api/admin/bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      // Fallback to router refresh
      router.refresh();
    }
  };

  // Helper to extract date part from datetime string (YYYY-MM-DD) without timezone conversion
  const getDatePart = (dateString) => {
    if (!dateString) return null;
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return match[0]; // Returns YYYY-MM-DD
    }
    return null;
  };

  // Get today's date string in YYYY-MM-DD format (local timezone)
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Count upcoming bookings (not in the past)
  const todayString = getTodayString();
  const upcomingCount = bookings.filter((booking) => {
    if (!booking.preferred_datetime) return false;
    const bookingDateString = getDatePart(booking.preferred_datetime);
    if (!bookingDateString) return false;
    return bookingDateString >= todayString;
  }).length;

  // Find today's bookings (only confirmed ones)
  const todaysBookings = useMemo(() => {
    const todayStr = getTodayString();

    return bookings.filter((booking) => {
      if (!booking.preferred_datetime) return false;
      if (booking.status !== "confirmed") return false;
      const bookingDateString = getDatePart(booking.preferred_datetime);
      return bookingDateString === todayStr;
    });
  }, [bookings]);

  const getCompanyName = (booking) => {
    if (booking.booking_data?.contact?.company) {
      return booking.booking_data.contact.company;
    }
    return booking.contact_company || null;
  };

  const getGuestCount = (booking) => {
    return booking.guest_count || booking.booking_data?.guestCount || null;
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 lg:pt-28 pb-4 sm:pb-6 lg:pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Venue Bookings
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {upcomingCount} {upcomingCount === 1 ? "upcoming booking" : "upcoming bookings"}
          </p>
          <div className="mt-4 flex justify-center">
            <Link
              href="/whitelotus/booking/admin/new"
              className="inline-flex items-center justify-center rounded-full bg-[#a77d3b] px-5 py-2.5 text-sm font-light text-white shadow-sm hover:bg-[#8b6a2f] transition"
            >
              New internal booking
            </Link>
          </div>
        </div>

        {/* Today's Booking Banner */}
        {todaysBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex justify-center"
          >
            <div className="w-full max-w-2xl">
              <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 sm:px-8 sm:py-6">
                  <div className="flex items-center gap-2.5 mb-5 justify-center">
                    <Calendar className="w-5 h-5 text-emerald-700" />
                    <h2 className="text-lg font-light text-emerald-900 tracking-tight">
                      Today's Booking{todaysBookings.length > 1 ? "s" : ""}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {todaysBookings.map((booking) => {
                      const companyName = getCompanyName(booking);
                      return (
                        <Link
                          key={booking.id}
                          href={`/whitelotus/booking/${booking.reference_id}`}
                          className="block bg-white/60 hover:bg-white/80 rounded-xl p-4 sm:p-5 transition-all duration-200 border border-emerald-100/50 hover:border-emerald-200/70 hover:shadow-sm group"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex-1 min-w-0 text-center sm:text-left">
                                <p className="text-gray-900 font-light text-base sm:text-lg mb-1">
                                  {booking.contact_name}
                                </p>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-gray-600">
                                  {companyName && (
                                    <p className="font-light">
                                      {companyName}
                                    </p>
                                  )}
                                {getGuestCount(booking) && (
                                    <div className="flex items-center gap-1.5">
                                      <Users className="w-3.5 h-3.5 text-gray-400" />
                                      <span className="font-light">
                                        {getGuestCount(booking)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-center sm:justify-end gap-4 text-gray-700">
                                {booking.start_time && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-light">
                                      {booking.start_time}
                                      {booking.end_time && ` – ${booking.end_time}`}
                                    </span>
                                  </div>
                                )}
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bookings Table */}
        <BookingsTable bookings={bookings} onBookingsUpdated={handleBookingsUpdated} />

        {/* Booking Details Modal */}
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onBookingUpdated={handleBookingsUpdated}
        />
      </div>
    </div>
  );
}

