import HeroVenue from "@/app/whitelotus/components/HeroVenue";
import ImageSlider from "@/app/whitelotus/components/ImageSlider";
import AboutTheSpace from "@/app/whitelotus/components/AboutTheSpace";
import VenueDetails from "@/app/whitelotus/components/VenueDetails";
import WhatYouCanHost from "@/app/whitelotus/components/WhatYouCanHost";
import HostYourEvent from "@/app/whitelotus/components/HostYourEvent";
import UpcomingEventsPreview from "@/app/whitelotus/components/UpcomingEventsPreview";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/util/supabase/server";
import {
  calculateTicketsSold,
  isEventSoldOut,
} from "@/util/event-capacity-util";

export const revalidate = 300; // Revalidate every 5 minutes

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  const translations = {
    en: {
      title: "White Lotus | Mama Reykjavik",
      description:
        "A refined event space for music, movement, ceremony & celebration. Intimate, high-quality venue in downtown Reykjavík for conscious gatherings and creative expression.",
      ogTitle: "White Lotus Event Venue | Mama Reykjavik",
      ogDescription:
        "Host your next event at White Lotus. An intimate, high-quality venue in downtown Reykjavík designed for conscious gatherings, creative expression, and unforgettable nights.",
    },
    is: {
      title: "White Lotus | Mama Reykjavík",
      description:
        "Fínn viðburðarstaður fyrir tónlist, hreyfingu, athafnir og hátíðahöld. Náinn og hágæða viðburðarstaður í miðbæ Reykjavíkur fyrir meðvitaðar samkomur og skapandi tjáningu.",
      ogTitle: "White Lotus Viðburðarstaður | Mama Reykjavík",
      ogDescription:
        "Hýstu næsta viðburðinn þinn á White Lotus. Náinn og hágæða viðburðarstaður í miðbæ Reykjavíkur hannaður fyrir meðvitaðar samkomur, skapandi tjáningu og ógleymanlegar nætur.",
    },
  };

  const t = translations[language];

  return {
    title: t.title,
    description: t.description,
    canonical: "https://mama.is/whitelotus",
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: "https://mama.is/whitelotus",
      images: [
        {
          url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/whitelotusbanner.jpg?alt=media&token=ddb5d9ad-25af-4307-b37f-ceaa1b79002a",
          width: 1200,
          height: 630,
          alt: "White Lotus Venue Space",
        },
      ],
      type: "website",
    },
  };
}

async function getUpcomingEvents() {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const supabase = await createServerSupabase();

    // Fetch more events than needed to account for filtering
    const { data: events, error } = await supabase
      .from("events")
      .select(
        `
        id, 
        name, 
        date, 
        image, 
        slug, 
        shortdescription,
        duration,
        tickets(quantity, status),
        capacity
      `
      )
      .gte("date", yesterday.toISOString())
      .order("date", { ascending: true })
      .limit(10); // Fetch more to ensure we get 3 after filtering

    if (error) {
      console.error("Error fetching events:", error);
      return [];
    }

    // Filter events that haven't ended yet
    const filteredEvents =
      events?.filter((event) => {
        const eventStart = new Date(event.date);
        const duration = event.duration || 2; // Default 2 hours
        const eventEnd = new Date(
          eventStart.getTime() + duration * 60 * 60 * 1000
        );
        return eventEnd > now;
      }) || [];

    // Take the 3 most upcoming events
    const upcomingEvents = filteredEvents.slice(0, 3);

    // Calculate sold out status
    return upcomingEvents.map((event) => {
      const ticketsSold = calculateTicketsSold(event.tickets || []);
      const soldOut = isEventSoldOut(event, ticketsSold);
      return {
        ...event,
        sold_out: soldOut,
      };
    });
  } catch (error) {
    console.error("Error in getUpcomingEvents:", error);
    return [];
  }
}

export default async function Venue() {
  const events = await getUpcomingEvents();

  return (
    <div className="relative isolate overflow-hidden">
      {/* Main Content */}
      <div className="w-full mx-auto flex flex-col items-center">
        <HeroVenue />
        <ImageSlider />
        <AboutTheSpace />
        <VenueDetails />
        <WhatYouCanHost />
        <HostYourEvent />
        <UpcomingEventsPreview events={events} />
      </div>
    </div>
  );
}
