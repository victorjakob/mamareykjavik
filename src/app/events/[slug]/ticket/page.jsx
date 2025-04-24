import BuyTicket from "./BuyTicket";
import { supabase } from "@/util/supabase/client";
import { notFound } from "next/navigation";

// Cache revalidation settings
export const revalidate = 3600; // Revalidate every hour

// Function to fetch event data with error handling
async function fetchEventData(slug) {
  if (!slug) return { event: null, error: new Error("No slug provided") };

  try {
    // First fetch the event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .single();

    if (eventError) throw eventError;
    if (!event) return { event: null, error: null };

    // Then fetch the ticket variants for this event
    const { data: ticketVariants, error: variantsError } = await supabase
      .from("ticket_variants")
      .select("*")
      .eq("event_id", event.id);

    if (variantsError) throw variantsError;

    // Add the variants to the event object
    return {
      event: {
        ...event,
        ticket_variants: ticketVariants || [],
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching event:", error.message);
    return { event: null, error };
  }
}

// Generate dynamic metadata
export async function generateMetadata({ params }) {
  const { slug } = await params; // Await the params

  if (!slug) {
    return {
      title: "Event Tickets | Mama Reykjavik",
      description:
        "Purchase tickets for events at Mama Reykjavik & White Lotus",
    };
  }

  const { event } = await fetchEventData(slug);

  if (!event) {
    return {
      title: "Event Tickets | Mama Reykjavik",
      description:
        "Purchase tickets for events at Mama Reykjavik & White Lotus",
    };
  }

  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const defaultImage =
    "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1";

  return {
    title: `Tickets for ${event.name} | Mama Reykjavik`,
    description: `Secure your spot at ${event.name} on ${eventDate}. Book your tickets now for this special event at Mama Reykjavik & White Lotus.`,
    openGraph: {
      title: `Get Tickets - ${event.name} | Mama Reykjavik`,
      description: `Don't miss out on ${event.name} happening on ${eventDate}. Book your tickets now for this special event at Mama Reykjavik & White Lotus.`,
      url: `https://mama.is/events/${event.slug}/ticket`,
      images: [
        {
          url: event.image || defaultImage,
          width: 1200,
          height: 630,
          alt: `Tickets for ${event.name}`,
          type: "image/jpeg",
        },
      ],
      type: "website",
      locale: "en_US",
      siteName: "Mama Reykjavik",
    },
    twitter: {
      card: "summary_large_image",
      title: `Tickets for ${event.name} | Mama Reykjavik`,
      description: `Secure your spot at ${event.name} on ${eventDate}. Book your tickets now!`,
      images: [event.image || defaultImage],
    },
  };
}

// Separate viewport export as per Next.js recommendation
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Main component to render the ticket page
export default async function TicketPage({ params }) {
  const { slug } = await params; // Await the params

  if (!slug) {
    notFound();
  }

  const { event, error } = await fetchEventData(slug);

  // Handle 404 for non-existent events
  if (!event) {
    notFound();
  }

  // Handle other errors
  if (error) {
    throw error; // Let Next.js error boundary handle it
  }

  return (
    <div className="pt-40 container mx-auto px-4 py-8">
      <BuyTicket event={event} />
    </div>
  );
}
