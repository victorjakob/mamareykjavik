import Event from "@/app/components/events/Event";
import { supabase } from "@/lib/supabase";

export const viewport = {
  themeColor: "#ffffff", // Optional but recommended
  width: "device-width",
  height: "device-height", // Optional
  initialScale: 1.0,
  minimumScale: 1.0,
  maximumScale: 5.0,
  userScalable: "yes",
  interactiveWidget: "resizes-content",
  viewportFit: "cover",
};

export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { slug } = resolvedParams;

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
      canonical: `https://mama.is/events/${slug}`,
      openGraph: {
        title: `${event?.name || "Event Details"} | Mama Reykjavik`,
        description:
          event?.description ||
          "Learn more about this unique event and secure your spot at Mama Reykjavik.",
        url: `https://mama.is/events/${slug}`,
        images: [
          {
            url: event?.image || "https://mama.is/assets/event-banner.jpg",
            width: 1200,
            height: 630,
            alt: event?.name || "Mama Reykjavik Event Details",
          },
        ],
        type: "website",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Event Details | Mama Reykjavik",
      description: "View event details at Mama Reykjavik & White Lotus.",
    };
  }
}

export default async function EventPage({ params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { slug } = resolvedParams;

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
  } catch (error) {
    console.error("Error loading event:", error);
    return (
      <div>
        <p>Error loading event details</p>
      </div>
    );
  }
}
