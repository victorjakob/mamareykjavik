import Event from "@/app/events/[slug]/Event";
import { supabase } from "@/util/supabase/client";

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
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600">
            We&apos;re having trouble loading the event right now.
          </p>
          <p className="text-gray-600">
            Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }

  // Fetch ticket variants for this event
  const { data: ticketVariants, error: variantsError } = await supabase
    .from("ticket_variants")
    .select("*")
    .eq("event_id", event.id);

  if (variantsError) {
    console.error("Error fetching ticket variants:", variantsError);
  }

  // Add ticket variants to the event object
  const eventWithVariants = {
    ...event,
    ticket_variants: ticketVariants || [],
  };

  return <Event event={eventWithVariants} />;
}
