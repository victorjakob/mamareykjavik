import { supabase } from "@/lib/supabase";
import BuyOrGetTicket from "@/app/components/events/BuyOrGetTicket";
import { notFound } from "next/navigation";

// Cache revalidation settings
export const revalidate = 3600; // Revalidate every hour

// Function to fetch event data with error handling
async function fetchEventData(slug) {
  try {
    const { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return { event, error: null };
  } catch (error) {
    console.error("Error fetching event:", error.message);
    return { event: null, error };
  }
}

// Generate dynamic metadata with enhanced SEO optimization
export async function generateMetadata({ params }) {
  const { event } = await fetchEventData(params.slug);

  if (!event) {
    return {
      title: "Event Tickets | Mama Reykjavik",
      description:
        "Purchase tickets for events at Mama Reykjavik & White Lotus",
      robots: "noindex, nofollow",
      viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 5,
      },
    };
  }

  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    title: `Tickets for ${event.name} | Mama Reykjavik`,
    description: `Secure your spot at ${event.name} on ${eventDate}. Book your tickets now for this special event at Mama Reykjavik & White Lotus.`,
    openGraph: {
      title: `Get Tickets - ${event.name} | Mama Reykjavik`,
      description: `Don't miss out on ${event.name} happening on ${eventDate}. Book your tickets now for this special event at Mama Reykjavik & White Lotus.`,
      url: `https://mamareykjavik.is/events/${event.slug}/ticket`,
      images: [
        {
          url:
            event.image ||
            "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
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
      images: [
        event.image ||
          "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
      ],
    },
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 5,
    },
    alternates: {
      canonical: `https://mamareykjavik.is/events/${event.slug}/ticket`,
    },
  };
}

// Main component to render the ticket page
export default async function TicketPage({ params }) {
  const { event, error } = await fetchEventData(params.slug);

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
      <BuyOrGetTicket event={event} />
    </div>
  );
}
