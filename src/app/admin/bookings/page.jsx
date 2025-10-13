import { createServerSupabase } from "@/util/supabase/server";
import AdminGuard from "../AdminGuard";
import BookingsTable from "./components/BookingsTable";
import { ClipboardList } from "lucide-react";

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
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <ClipboardList className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                Venue Bookings
              </h1>
            </div>
            <p className="text-gray-600">
              Manage and view all White Lotus venue booking requests
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Bookings
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {bookings.length}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <ClipboardList className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">
                    {bookings.filter((b) => b.status === "pending").length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <ClipboardList className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {bookings.filter((b) => b.status === "confirmed").length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <ClipboardList className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {bookings.filter((b) => b.status === "cancelled").length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <ClipboardList className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <BookingsTable bookings={bookings} />
        </div>
      </div>
    </AdminGuard>
  );
}




