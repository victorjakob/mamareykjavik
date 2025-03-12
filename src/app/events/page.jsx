import EventsHeroLogo from "./EventsHeroLogo";
import EventsList from "./EventsList";
import RentVenue from "../components/events/RendVenue";
import { supabase } from "@/util/supabase/client";

export const revalidate = 300; // Revalidate every 60 seconds

export const metadata = {
  title: "Upcoming Events | Mama Reykjavik",
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
  const now = new Date().toISOString();

  // Fetch events with ticket counts
  const { data: events, error } = await supabase
    .from("events")
    .select(
      `
      id, 
      name, 
      date, 
      image, 
      slug, 
      shortdescription, 
      price, 
      duration, 
      early_bird_price, 
      early_bird_date,
      tickets!inner(quantity, status)
    `
    )
    .gt("date", now)
    .order("date", { ascending: true });

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600">
            We're having trouble loading the events right now.
          </p>
          <p className="text-gray-600">
            Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }

  // Calculate ticket counts for each event
  const eventsWithTickets =
    events?.map((event) => ({
      ...event,
      ticketCount:
        event.tickets?.reduce((sum, ticket) => {
          if (ticket.status === "paid" || ticket.status === "door") {
            return sum + (ticket.quantity || 0);
          }
          return sum;
        }, 0) || 0,
    })) || [];

  return (
    <div className="mt-14 md:mt-20 ">
      <EventsHeroLogo />
      <EventsList events={eventsWithTickets} />
      <RentVenue />
    </div>
  );
}
