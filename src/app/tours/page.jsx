import { createServerSupabase } from "@/util/supabase/server";
import WelcomeText from "./WelcomeText";
import TourCards from "./TourCards";

export const dynamic = "force-dynamic";

async function getTours() {
  const supabase = createServerSupabase();
  const { data: tours, error } = await supabase
    .from("tours")
    .select(
      `
      *,
      tour_sessions (
        start_time,
        available_spots,
        tour_bookings (
          number_of_tickets
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tours:", error);
    return [];
  }

  // Process tours to include next available session and spots
  const processedTours = tours.map((tour) => {
    const futureSessions =
      tour.tour_sessions
        ?.filter((session) => new Date(session.start_time) > new Date())
        ?.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
        ?.map((session) => {
          // Calculate tickets sold for each session
          const ticketsSold =
            session.tour_bookings?.reduce(
              (acc, booking) => acc + (booking.number_of_tickets || 0),
              0
            ) || 0;

          return {
            start_time: session.start_time,
            availableSpots: session.available_spots - ticketsSold,
            totalSpots: session.available_spots,
          };
        }) || [];

    return {
      ...tour,
      tour_sessions: futureSessions,
    };
  });

  return processedTours;
}

export default async function Tours() {
  const tours = await getTours();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl pt-32 mx-auto text-center">
        <WelcomeText />
        <TourCards tours={tours} />
      </div>
    </div>
  );
}
