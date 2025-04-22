import { createServerSupabase } from "@/util/supabase/server";
import { notFound } from "next/navigation";
import BookingForm from "./BookingForm";
import TourHeader from "./TourHeader";

async function getTourData(slug) {
  const supabase = createServerSupabase();

  // Fetch tour data
  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .select("*")
    .eq("slug", slug)
    .single();

  if (tourError || !tour) {
    return notFound();
  }

  // Fetch available sessions for the tour
  const { data: sessions, error: sessionsError } = await supabase
    .from("tour_sessions")
    .select("*")
    .eq("tour_id", tour.id)
    .gt("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  if (sessionsError) {
    console.error("Error fetching sessions:", sessionsError);
    return { tour, sessions: [] };
  }

  return { tour, sessions };
}

export default async function BookingPage({ params }) {
  const { tour, sessions } = await getTourData(params.slug);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="pt-16 text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book Your Adventure
          </h1>
          <p className="text-gray-600">
            Complete your booking in a few simple steps
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <TourHeader tour={tour} />
          <BookingForm tour={tour} sessions={sessions} />
        </div>
      </div>
    </div>
  );
}
