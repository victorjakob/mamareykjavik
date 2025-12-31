import { createServerSupabase } from "@/util/supabase/server";
import AdminGuard from "../AdminGuard";
import BookingsPageClient from "./BookingsPageClient";

async function getBookings() {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("whitelotus_bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }

  return data || [];
}

export const metadata = {
  title: "Venue Bookings | Admin Dashboard",
  description: "Manage White Lotus venue bookings",
};

export default async function AdminBookingsPage() {
  const bookings = await getBookings();

  return (
    <AdminGuard>
      <BookingsPageClient initialBookings={bookings} />
    </AdminGuard>
  );
}




