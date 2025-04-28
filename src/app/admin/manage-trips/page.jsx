import { createServerSupabase } from "@/util/supabase/server";
import TourDashboard from "./components/TourDashboard";
import AdminGuard from "../AdminGuard";

export const dynamic = "force-dynamic";

async function getTours() {
  const supabase = createServerSupabase();
  const { data: tours, error } = await supabase
    .from("tours")
    .select(
      `
      *,
      tour_sessions (
        id,
        start_time,
        available_spots,
        tour_bookings (
          id,
          customer_name,
          number_of_tickets,
          payment_status
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tours:", error);
    return [];
  }

  // Process the data to include session counts and booking information
  const processedTours = tours.map((tour) => ({
    ...tour,
    tour_sessions: tour.tour_sessions || [],
    sessionCount: tour.tour_sessions?.length || 0,
    totalBookings:
      tour.tour_sessions?.reduce(
        (acc, session) => acc + (session.tour_bookings?.length || 0),
        0
      ) || 0,
    upcomingSessions:
      tour.tour_sessions?.filter(
        (session) => new Date(session.start_time) > new Date()
      ).length || 0,
  }));

  return processedTours;
}

export default async function ManageTripsPage() {
  const tours = await getTours();

  return (
    <div className="min-h-screen  pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
            Tour Management
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Create and manage your tours, sessions, and view bookings
          </p>
        </div>

        <div className="mt-16">
          <TourDashboard initialTours={tours} />
        </div>
      </div>
    </div>
  );
}
