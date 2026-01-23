import Event from "@/app/events/[slug]/Event";
import { createServerSupabaseComponent } from "@/util/supabase/serverComponent";
import {
  calculateTicketsSold,
  isEventSoldOut,
} from "@/util/event-capacity-util";
import { notFound, permanentRedirect } from "next/navigation";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

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
    const language = await getLocaleFromHeaders();
    const pathname = `/events/${slug}`;
    const alternates = alternatesFor({ locale: language, pathname, translated: true });

    const supabase = await createServerSupabaseComponent();

    const { data: event } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .single();

    const defaultDescription =
      language === "is"
        ? "Skoðaðu upplýsingar um viðburð og tryggðu þér sæti hjá Mama Reykjavík & White Lotus."
        : "View details and book your spot for this special event at Mama Reykjavik & White Lotus.";

    const titlePrefix = language === "is" ? "Viðburður" : "Event";
    const eventName = event?.name || (language === "is" ? "Upplýsingar" : "Details");

    const formatted = formatMetadata({
      title: `${eventName} | Mama Reykjavik`,
      description: event?.description || defaultDescription,
    });

    return {
      title: formatted.title,
      description: formatted.description,
      alternates,
      openGraph: {
        title: `${titlePrefix}: ${eventName} | White Lotus & Mama`,
        description: event?.description || defaultDescription,
        url: alternates.canonical,
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
        locale: ogLocale(language),
      },
      twitter: {
        card: "summary_large_image",
        title: `${eventName} | Mama Reykjavik`,
        description: event?.description || defaultDescription,
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

  if (error || !event) {
    // Missing/invalid slug should be a real 404 for SEO.
    return notFound();
  }

  // If event is older than 3 months, permanently redirect to /events
  // to de-index old content while keeping URLs "handled".
  const eventDate = event?.date ? new Date(event.date) : null;
  if (!eventDate || Number.isNaN(eventDate.getTime())) {
    return notFound();
  }
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  if (eventDate < threeMonthsAgo) {
    return permanentRedirect("/events");
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
