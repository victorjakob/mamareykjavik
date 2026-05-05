import BuyTicket from "./BuyTicket";
import { supabase } from "@/util/supabase/client";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { formatMetadata } from "@/lib/seo-utils";

// Cache revalidation settings
export const revalidate = 3600; // Revalidate every hour

// If the slug is actually a series (e.g. /events/qi-gong/ticket from a
// poster URL), forward the buyer to the next upcoming instance's ticket
// page. Returns the slug to redirect to, or null if not a series.
async function resolveSeriesNextInstanceSlug(slug) {
  const { data: series } = await supabase
    .from("event_series")
    .select("id, is_active")
    .eq("slug", slug)
    .maybeSingle();
  if (!series || series.is_active === false) return null;

  const yesterdayIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: instances } = await supabase
    .from("events")
    .select("slug, date, duration")
    .eq("series_id", series.id)
    .gte("date", yesterdayIso)
    .order("date", { ascending: true });

  const now = Date.now();
  const next = (instances || []).find((inst) => {
    const start = new Date(inst.date).getTime();
    const durationMs = (inst.duration || 2) * 60 * 60 * 1000;
    return start + durationMs > now;
  });
  return next?.slug || null;
}

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
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  const translations = {
    en: {
      defaultTitle: "Event Tickets | Mama Reykjavik",
      defaultDescription:
        "Purchase tickets for events at Mama Reykjavik & White Lotus",
      ticketTitle: "Tickets for",
      ticketDescription: "Secure your spot at",
      ticketDescriptionEnd:
        "Book your tickets now for this special event at Mama Reykjavik & White Lotus.",
      ogTitle: "Get Tickets -",
      ogDescription: "Don't miss out on",
      ogDescriptionEnd:
        "Book your tickets now for this special event at Mama Reykjavik & White Lotus.",
      twitterDescription: "Secure your spot at",
      twitterDescriptionEnd: "Book your tickets now!",
    },
    is: {
      defaultTitle: "Viðburðarmiðar | Mama Reykjavík",
      defaultDescription:
        "Kaupa miða fyrir viðburði á Mama Reykjavík & White Lotus",
      ticketTitle: "Miðar fyrir",
      ticketDescription: "Taktu frá plássi þínu á",
      ticketDescriptionEnd:
        "Bókaðu miðana þína núna fyrir þennan sérstaka viðburð á Mama Reykjavík & White Lotus.",
      ogTitle: "Fáðu miða -",
      ogDescription: "Ekki missa af",
      ogDescriptionEnd:
        "Bókaðu miðana þína núna fyrir þennan sérstaka viðburð á Mama Reykjavík & White Lotus.",
      twitterDescription: "Taktu frá plássi þínu á",
      twitterDescriptionEnd: "Bókaðu miðana þína núna!",
    },
  };

  const t = translations[language];

  if (!slug) {
    const formatted = formatMetadata({
      title: t.defaultTitle,
      description: t.defaultDescription,
      isTicketPage: true,
    });
    return {
      title: formatted.title,
      description: formatted.description,
    };
  }

  const { event } = await fetchEventData(slug);

  if (!event) {
    const formatted = formatMetadata({
      title: t.defaultTitle,
      description: t.defaultDescription,
      isTicketPage: true,
    });
    return {
      title: formatted.title,
      description: formatted.description,
    };
  }

  const eventDate = new Date(event.date).toLocaleDateString(
    language === "is" ? "is-IS" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const defaultImage =
    "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg";

  const formatted = formatMetadata({
    title: `${t.ticketTitle} ${event.name} | Mama Reykjavik`,
    description: `${t.ticketDescription} ${event.name} ${eventDate}. ${t.ticketDescriptionEnd}`,
    isTicketPage: true,
  });

  return {
    title: formatted.title,
    description: formatted.description,
    openGraph: {
      title: `${t.ogTitle} ${event.name} | Mama Reykjavik`,
      description: `${t.ogDescription} ${event.name} ${eventDate}. ${t.ogDescriptionEnd}`,
      url: `https://mama.is/events/${event.slug}/ticket`,
      images: [
        {
          url: event.image || defaultImage,
          width: 1200,
          height: 630,
          alt: `${t.ticketTitle} ${event.name}`,
          type: "image/jpeg",
        },
      ],
      type: "website",
      locale: language === "is" ? "is_IS" : "en_US",
      siteName: "Mama Reykjavik",
    },
    twitter: {
      card: "summary_large_image",
      title: `${t.ticketTitle} ${event.name} | Mama Reykjavik`,
      description: `${t.twitterDescription} ${event.name} ${eventDate}. ${t.twitterDescriptionEnd}`,
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

  // If the slug points at a series, forward the buyer to the next
  // upcoming instance's ticket page. This is the part that lets a
  // 2-month FB ad linked at /events/qi-gong/ticket keep working as
  // each Tuesday rolls past.
  const seriesNextSlug = await resolveSeriesNextInstanceSlug(slug);
  if (seriesNextSlug) {
    redirect(`/events/${seriesNextSlug}/ticket`);
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

  // Bare-event ticket URL whose date has already passed AND that belongs
  // to a series → redirect up to the series page so the user can pick a
  // future date instead of seeing a stale "buy" form.
  if (event.series_id) {
    const eventStart = new Date(event.date);
    const eventEnd = new Date(
      eventStart.getTime() + (event.duration || 2) * 60 * 60 * 1000
    );
    if (eventEnd <= new Date()) {
      const { data: parent } = await supabase
        .from("event_series")
        .select("slug, is_active")
        .eq("id", event.series_id)
        .maybeSingle();
      if (parent?.slug && parent.is_active !== false) {
        redirect(`/events/${parent.slug}`);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1208]" data-navbar-theme="dark">
      <div className="pt-28 pb-20 max-w-2xl mx-auto px-4">
        <BuyTicket event={event} />
      </div>
    </div>
  );
}
