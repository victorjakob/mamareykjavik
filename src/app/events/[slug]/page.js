import Event from "@/app/components/events/Event";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({ params }) {
  const { slug } = params;

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  return {
    title: `${event?.name || "Event Details"} | Mama Reykjavik`,
    description:
      event?.description ||
      "View details and book your spot for this special event at Mama Reykjavik & White Lotus.",
    canonical: `https://mamareykjavik.is/events/${slug}`,
    openGraph: {
      title: `${event?.name || "Event Details"} | Mama Reykjavik`,
      description:
        event?.description ||
        "Learn more about this unique event and secure your spot at Mama Reykjavik.",
      url: `https://mamareykjavik.is/events/${slug}`,
      images: [
        {
          url:
            event?.image || "https://mamareykjavik.is/assets/event-banner.jpg",
          width: 1200,
          height: 630,
          alt: event?.name || "Mama Reykjavik Event Details",
        },
      ],
      type: "website",
    },
  };
}

export default async function EventPage({ params }) {
  const { slug } = params;

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  return (
    <div>
      <Event event={event} />
    </div>
  );
}
