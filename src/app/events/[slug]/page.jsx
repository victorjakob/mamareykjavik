import Event from "@/app/events/[slug]/Event";
import { createServerSupabaseComponent } from "@/util/supabase/serverComponent";
import {
  calculateTicketsSold,
  isEventSoldOut,
} from "@/util/event-capacity-util";

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
    const { slug } = await params;

    const supabase = await createServerSupabaseComponent();

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
        title: `${event?.name || "Event Details"} | White Lotus & Mama`,
        description:
          event?.description ||
          "Learn more about this unique event and secure your spot at Mama Reykjavik.",
        url: `https://mama.is/events/${slug}`,
        images: [
          {
            url:
              event?.image ||
              "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/whitelotusbanner.jpg?alt=media&token=ddb5d9ad-25af-4307-b37f-ceaa1b79002a",
            width: 1200,
            height: 630,
            alt: event?.name || "White Lotus & Mama Event Details",
          },
        ],
        type: "website",
        siteName: "Mama Reykjavik",
      },
      twitter: {
        card: "summary_large_image",
        title: `${event?.name || "Event Details"} | Mama Reykjavik`,
        description:
          event?.description ||
          "Learn more about this unique event and secure your spot at Mama Reykjavik.",
        images: [
          event?.image ||
            "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2FGenerated_Logo_White_Lotus_darktext_transparent.png?alt=media&token=59618fb8-21e8-483e-b4c0-b49d4651955f",
        ],
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
  const { slug } = await params;

  const supabase = await createServerSupabaseComponent();
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
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

  // Fetch tickets to calculate sold out status
  const { data: tickets, error: ticketsError } = await supabase
    .from("tickets")
    .select("quantity, status")
    .eq("event_id", event.id);

  if (ticketsError) {
    console.error("Error fetching tickets:", ticketsError);
  }

  // Calculate sold out status
  const ticketsSold = calculateTicketsSold(tickets || []);
  const soldOut = isEventSoldOut(event, ticketsSold);

  // Add ticket variants and sold out status to the event object
  const eventWithVariants = {
    ...event,
    ticket_variants: ticketVariants || [],
    sold_out: soldOut,
    ticketsSold, // Include for reference
  };

  return <Event event={eventWithVariants} />;
}
