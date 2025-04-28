import { createServerSupabase } from "@/util/supabase/server";
import TripsDashboard from "./components/TripsDashboard";
import ClientPage from "./components/ClientPage";

export const dynamic = "force-dynamic";

// This is the server component that fetches data
async function getTripsData(email) {
  const supabase = createServerSupabase();

  const { data: bookings, error } = await supabase
    .from("tour_bookings")
    .select(
      `
      *,
      tour_sessions:tour_session_id (
        start_time,
        tours:tour_id (
          name,
          description,
          duration_minutes,
          price
        )
      )
    `
    )
    .eq("customer_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching trips:", error);
    return [];
  }

  return bookings;
}

export default async function MyTripsPage(props) {
  // Await the searchParams
  const searchParams = await Promise.resolve(props.searchParams);
  const email = searchParams?.email;

  // If no email, render the client component that will handle session
  if (!email) {
    return <ClientPage />;
  }

  // Fetch trips data using the email
  const tripsData = await getTripsData(email);

  // Separate trips into upcoming and past
  const now = new Date();
  const { upcomingTrips, pastTrips } = tripsData.reduce(
    (acc, trip) => {
      const tripDate = new Date(trip.tour_sessions.start_time);
      if (tripDate > now) {
        acc.upcomingTrips.push(trip);
      } else {
        acc.pastTrips.push(trip);
      }
      return acc;
    },
    { upcomingTrips: [], pastTrips: [] }
  );

  return (
    <div className="min-h-screen pt-20">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#4A5D23] mb-4">
              My Adventures
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Your journey with Mama - where every tour becomes a cherished
              memory
            </p>
          </div>
          <TripsDashboard upcomingTrips={upcomingTrips} pastTrips={pastTrips} />
        </div>
      </main>
    </div>
  );
}
