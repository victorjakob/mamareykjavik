import { createServerSupabase } from "@/util/supabase/server";
import WelcomeText from "./WelcomeText";
import TourCards from "./TourCards";
import { spotsLeft, SESSION_WITH_BOOKINGS_SELECT } from "@/lib/tourAvailability";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mama Tours — Travel with the Icelandic locals",
  description:
    "Small-group journeys from Mama Reykjavík — geothermal valleys, hot rivers, storytelling and plant-based food.",
};

async function getTours() {
  const supabase = createServerSupabase();
  const { data: tours, error } = await supabase
    .from("tours")
    .select(
      `
      *,
      tour_sessions (
        ${SESSION_WITH_BOOKINGS_SELECT}
      )
    `
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tours:", error);
    return [];
  }

  // Attach upcoming sessions with real remaining-seat counts.
  const now = Date.now();
  return tours.map((tour) => ({
    ...tour,
    tour_sessions: (tour.tour_sessions || [])
      .filter((session) => new Date(session.start_time).getTime() > now)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .map((session) => ({
        start_time: session.start_time,
        availableSpots: spotsLeft(session, now),
        totalSpots: session.available_spots,
      })),
  }));
}

export default async function Tours() {
  const tours = await getTours();

  return (
    <div
      data-navbar-theme="dark"
      className="min-h-screen w-full bg-[#110f0d] text-[#f0ebe3]"
    >
      <div className="max-w-6xl mx-auto pt-36 pb-24 px-4 sm:px-6">
        <WelcomeText />
        <TourCards tours={tours} />
      </div>
    </div>
  );
}
