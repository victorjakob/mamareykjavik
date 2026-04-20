import { createServerSupabase } from "@/util/supabase/server";
import TourDashboard from "./components/TourDashboard";
import AdminGuard from "../AdminGuard";
import {
  AdminShell,
  AdminHeader,
} from "@/app/admin/components/AdminShell";

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
    <AdminGuard>
      <AdminShell
        maxWidth="max-w-7xl"
        hero={
          <AdminHeader
            eyebrow="Admin"
            title="Tour Management"
            subtitle="Create and manage tours, sessions, and bookings"
          />
        }
      >
        <TourDashboard initialTours={tours} />
      </AdminShell>
    </AdminGuard>
  );
}
