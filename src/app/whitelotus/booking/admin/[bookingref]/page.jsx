"use client";

import AdminGuard from "@/app/admin/AdminGuard";
import AdminBookingEditView from "../components/AdminBookingEditView";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function AdminEditBookingPage() {
  const params = useParams();
  const bookingref = params?.bookingref;
  const [booking, setBooking] = useState(null);

  const fetchBooking = useCallback(async () => {
    if (!bookingref) return;
    const res = await fetch(`/api/wl/booking/${bookingref}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setBooking(data.booking || null);
  }, [bookingref]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <AdminBookingEditView
            booking={booking}
            bookingRef={bookingref}
            onSaved={fetchBooking}
          />
        </div>
      </div>
    </AdminGuard>
  );
}

