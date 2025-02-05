import EventsHeroLogo from "../components/events/EventsHeroLogo";
import EventsList from "../components/events/EventsList";
import RentVenue from "../components/events/RendVenue";

export const metadata = {
  title: "Upcoming Events | Mama Reykjavik",
  description:
    "Explore upcoming events at Mama Reykjavik & White Lotus, including cacao ceremonies, conscious dining, and live music experiences.",
  canonical: "https://mamareykjavik.is/events",
  openGraph: {
    title: "Upcoming Events at Mama Reykjavik & White Lotus",
    description:
      "Join us for unique experiences including concerts, cacao ceremonies, live music, ecstatic dance and more.",
    url: "https://mamareykjavik.is/events",
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

export default function Events() {
  return (
    <div className="mt-14 md:mt-20 ">
      <EventsHeroLogo />
      <EventsList />
      <RentVenue />
    </div>
  );
}
