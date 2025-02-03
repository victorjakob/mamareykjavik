import Event from "@/app/components/events/Event";

export const metadata = {
  title: "Event Details | Mama Reykjavik",
  description:
    "View details and book your spot for this special event at Mama Reykjavik & White Lotus.",
  canonical: "https://mamareykjavik.is/events/[slug]",
  openGraph: {
    title: "Event Details | Mama Reykjavik",
    description:
      "Learn more about this unique event and secure your spot at Mama Reykjavik.",
    url: "https://mamareykjavik.is/events/[slug]",
    images: [
      {
        url: "https://mamareykjavik.is/assets/event-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Mama Reykjavik Event Details",
      },
    ],
    type: "website",
  },
};

export default function EventPage() {
  return (
    <div>
      <Event />
    </div>
  );
}
