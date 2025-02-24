import EventsHeroLogo from "../components/events/EventsHeroLogo";
import EventsList from "../components/events/EventsList";
import RentVenue from "../components/events/RendVenue";
import { supabase } from "@/lib/supabase";

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

  const { data: events, error } = await supabase
    .from("events")
    .select(
      "id, name, date, image, slug, shortdescription, price, duration, early_bird_price, early_bird_date"
    )
    .gt("date", now)
    .order("date", { ascending: true });

  if (error) {
    return (
      <div className="text-center py-16 text-red-600">
        <p>Error loading events. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="mt-14 md:mt-20 ">
      <EventsHeroLogo />
      <EventsList events={events || []} />
      <RentVenue />
    </div>
  );
}
