import EventsHeroLogo from "./EventsHeroLogo";
import EventsList from "./EventsList";
import RentVenue from "../components/events/RendVenue";
import { createServerSupabase } from "@/util/supabase/server";

export const revalidate = 300; // Revalidate every 60 seconds

export const metadata = {
  title: "Upcoming Events | White Lotus & Mama",
  description:
    "Explore upcoming events at Mama Reykjavik & White Lotus, including cacao ceremonies, conscious dining, and live music experiences.",
  canonical: "https://mama.is/events",
  openGraph: {
    title: "Upcoming Events at Mama Reykjavik & White Lotus",
    description:
      "Join us for unique experiences including concerts, cacao ceremonies, live music, ecstatic dance and more.",
    url: "https://mama.is/events",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/whitelotusbanner.jpg?alt=media&token=ddb5d9ad-25af-4307-b37f-ceaa1b79002a",
        width: 1200,
        height: 630,
        alt: "White Lotus Events",
      },
    ],
    type: "website",
  },
};

export default async function Events() {
  const now = new Date();
  const supabase = await createServerSupabase(); // ✅ Await the correct server client

  // Calculate a time threshold for events that might still be happening
  // We'll show events that started within the last 24 hours (assuming max event duration)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Fetch events with ticket counts - only events that haven't ended yet
  const { data: events, error } = await supabase
    .from("events")
    .select(
      `
      id, 
      name, 
      date, 
      image, 
      slug, 
      host,
      shortdescription, 
      price, 
      duration, 
      early_bird_price, 
      early_bird_date,
      has_sliding_scale,
      sliding_scale_min,
      sliding_scale_max,
      sliding_scale_suggested,
      tickets(quantity, status),
      ticket_variants(id, name, price, capacity)
    `
    )
    .gte("date", yesterday.toISOString()) // Show events from yesterday onwards
    .order("date", { ascending: true });

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600">
            We&apos;re having trouble loading the events right now.
          </p>
          <p className="text-gray-600">
            Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }

  // Filter events to show upcoming events and currently happening events
  const filteredEvents =
    events?.filter((event) => {
      const eventStart = new Date(event.date);
      const eventEnd = new Date(
        eventStart.getTime() + (event.duration || 2) * 60 * 60 * 1000
      ); // Add duration in hours (default 2 hours if no duration)

      // Show events that haven't ended yet (either upcoming or currently happening)
      return eventEnd > now;
    }) || [];

  // Calculate ticket counts for each event
  const eventsWithTickets = filteredEvents.map((event) => ({
    ...event,
    ticketCount:
      event.tickets?.reduce((sum, ticket) => {
        if (ticket.status === "paid" || ticket.status === "door") {
          return sum + (ticket.quantity || 0);
        }
        return sum;
      }, 0) || 0,
  }));

  return (
    <div className="mt-14 md:mt-20 ">
      <EventsHeroLogo />
      <EventsList events={eventsWithTickets} />
      <RentVenue />
    </div>
  );
}
