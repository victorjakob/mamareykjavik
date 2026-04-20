"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Users, PlusCircle } from "lucide-react";
import BookingsTable from "./components/BookingsTable";
import BookingDetailsModal from "./components/BookingDetailsModal";
import { AdminShell, AdminHero } from "@/app/admin/components/AdminShell";

export default function BookingsPageClient({ initialBookings }) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookingsUpdated = async () => {
    try {
      const response = await fetch("/api/admin/bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      router.refresh();
    }
  };

  const getDatePart = (dateString) => {
    if (!dateString) return null;
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? match[0] : null;
  };

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayString = getTodayString();
  const upcomingCount = bookings.filter((booking) => {
    if (!booking.preferred_datetime) return false;
    const bookingDateString = getDatePart(booking.preferred_datetime);
    if (!bookingDateString) return false;
    return bookingDateString >= todayString;
  }).length;

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
    if (booking.booking_data?.contact?.company) return booking.booking_data.contact.company;
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
    <AdminShell>
      <AdminHero
        eyebrow="Admin · White Lotus"
        title="Venue Bookings"
        subtitle={`${upcomingCount} ${upcomingCount === 1 ? "upcoming booking" : "upcoming bookings"}`}
        action={
          <Link
            href="/whitelotus/booking/admin/new"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all"
            style={{ background: "#ff914d", color: "#1a0f06", boxShadow: "0 4px 18px rgba(255,145,77,0.35)" }}
          >
            <PlusCircle className="w-4 h-4" />
            New booking
          </Link>
        }
      />

        {/* Today's Booking Banner */}
        {todaysBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="rounded-2xl overflow-hidden"
              style={{
                background: "#ffffff",
                border: "1.5px solid #f0e6d8",
                boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
              }}>
              <div className="h-[1.5px]" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.5), transparent 60%)" }} />
              <div className="px-6 py-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255,145,77,0.14)" }}>
                    <Calendar className="w-4 h-4 text-[#ff914d]" />
                  </div>
                  <h2 className="text-[#2c1810] text-sm font-medium">
                    Today's Booking{todaysBookings.length > 1 ? "s" : ""}
                  </h2>
                </div>
                <div className="space-y-2">
                  {todaysBookings.map((booking) => {
                    const companyName = getCompanyName(booking);
                    return (
                      <Link
                        key={booking.id}
                        href={`/whitelotus/booking/${booking.reference_id}`}
                        className="group flex items-center justify-between rounded-xl p-4 transition-all"
                        style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[#2c1810] text-sm font-medium">{booking.contact_name}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-0.5">
                            {companyName && <p className="text-xs text-[#9a7a62]">{companyName}</p>}
                            {getGuestCount(booking) && (
                              <div className="flex items-center gap-1 text-xs text-[#9a7a62]">
                                <Users className="w-3 h-3" />
                                <span>{getGuestCount(booking)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-[#9a7a62]">
                          {booking.start_time && (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{booking.start_time}{booking.end_time && ` – ${booking.end_time}`}</span>
                            </div>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 group-hover:text-[#ff914d] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    );
                  })}
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
    </AdminShell>
  );
}
