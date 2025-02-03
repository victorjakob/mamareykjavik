import EventsList from "../components/events/EventsList";

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
        url: "https://mamareykjavik.is/assets/event-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Mama Reykjavik Events",
      },
    ],
    type: "website",
  },
};

export default function Events() {
  return (
    <div className="mt-14 sm:mt-32  lg:px-8">
      <h1 className="leading-relaxed text-3xl font-bold text-right md:text-center w-1/2 md:w-full ml-auto md:ml-0 pr-8 mx-4 sm:mx-0">
        Upcoming Events
      </h1>
      <EventsList />
    </div>
  );
}
