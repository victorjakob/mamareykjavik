import { createServerSupabase } from "@/util/supabase/server";
import { notFound } from "next/navigation";
import BookingForm from "./BookingForm";
import TourHeader from "./TourHeader";
import { spotsLeft, SESSION_WITH_BOOKINGS_SELECT } from "@/lib/tourAvailability";

export const dynamic = "force-dynamic";

async function getTourData(slug) {
  const supabase = createServerSupabase();

  // Fetch tour data
  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (tourError || !tour) {
    return null;
  }

  // Fetch upcoming sessions incl. bookings so we can expose REMAINING
  // seats (available_spots alone is the total, not what's left).
  const { data: sessions, error: sessionsError } = await supabase
    .from("tour_sessions")
    .select(SESSION_WITH_BOOKINGS_SELECT)
    .eq("tour_id", tour.id)
    .gt("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  if (sessionsError) {
    console.error("Error fetching sessions:", sessionsError);
    return { tour, sessions: [] };
  }

  const now = Date.now();
  const processedSessions = (sessions || []).map((session) => ({
    id: session.id,
    start_time: session.start_time,
    available_spots: spotsLeft(session, now),
    total_spots: session.available_spots,
  }));

  return { tour, sessions: processedSessions };
}

export default async function BookingPage({ params }) {
  const { slug } = await params;
  const data = await getTourData(slug);
  if (!data) notFound();
  const { tour, sessions } = data;

  return (
    <div
      data-navbar-theme="dark"
      className="min-h-screen bg-[#110f0d] py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <div className="pt-24 text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
            <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">
              Mama Tours
            </span>
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
          </div>
          <h1
            className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-3"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)" }}
          >
            Book your journey
          </h1>
          <p className="text-[#a09488] text-sm">
            Complete your booking in a few simple steps
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <TourHeader tour={tour} />
          <BookingForm tour={tour} sessions={sessions} />
        </div>
      </div>
    </div>
  );
}
