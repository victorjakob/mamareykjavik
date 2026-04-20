import EventsHeroLogo from "../events/EventsHeroLogo";
import EventsList from "../events/EventsList";
import RentVenue from "../components/events/RendVenue";
import { createServerSupabase } from "@/util/supabase/server";
import {
  calculateTicketsSold,
  isEventSoldOut,
} from "@/util/event-capacity-util";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export const revalidate = 300;

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/past-events";
  const alternates = alternatesFor({
    locale: language,
    pathname,
    translated: true,
  });

  const translations = {
    en: {
      title: "Past Events | White Lotus & Mama",
      description:
        "Browse past events at Mama Reykjavik & White Lotus, including concerts, cacao ceremonies, and community gatherings.",
      ogTitle: "Past Events at Mama Reykjavik & White Lotus",
      ogDescription:
        "Explore our archive of past events and experiences hosted by Mama Reykjavik & White Lotus.",
    },
    is: {
      title: "Liðnir viðburðir | White Lotus & Mama",
      description:
        "Skoðaðu liðna viðburði hjá Mama Reykjavík & White Lotus, þar á meðal tónleika, cacao athafnir og samfélagsviðburði.",
      ogTitle: "Liðnir viðburðir hjá Mama Reykjavík & White Lotus",
      ogDescription:
        "Skoðaðu safn af liðnum viðburðum og upplifunum á vegum Mama Reykjavík & White Lotus.",
    },
  };

  const t = translations[language];
  const formatted = formatMetadata({
    title: t.title,
    description: t.description,
  });

  return {
    title: formatted.title,
    description: formatted.description,
    alternates,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/whitelotusbanner.jpg",
          width: 1200,
          height: 630,
          alt: "White Lotus Past Events",
        },
      ],
      type: "website",
      locale: ogLocale(language),
    },
  };
}

export default async function PastEventsPage() {
  const now = new Date();
  const supabase = await createServerSupabase();

  const { data: events, error } = await supabase
    .from("events")
    .select(
      `
      id,
      name,
      date,
      image,
      slug,
      host,
      shortdescription,
      price,
      duration,
      early_bird_price,
      early_bird_date,
      has_sliding_scale,
      sliding_scale_min,
      sliding_scale_max,
      sliding_scale_suggested,
      capacity,
      sold_out,
      tickets(quantity, status),
      ticket_variants(id, name, price, capacity)
    `
    )
    .lt("date", now.toISOString())
    .order("date", { ascending: false });

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600">
            We&apos;re having trouble loading past events right now.
          </p>
          <p className="text-gray-600">
            Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }

  const filteredEvents =
    events?.filter((event) => {
      const eventStart = new Date(event.date);
      const eventEnd = new Date(
        eventStart.getTime() + (event.duration || 2) * 60 * 60 * 1000
      );
      return eventEnd <= now;
    }) || [];

  const eventsWithTickets = filteredEvents.map((event) => {
    const ticketsSold = calculateTicketsSold(event.tickets || []);
    const ticketCount = ticketsSold;
    const soldOut = isEventSoldOut(event, ticketsSold);

    return {
      ...event,
      ticketCount,
      sold_out: soldOut,
      ticketsSold,
    };
  });

  return (
    <>
      <div className="mt-14 md:mt-20" data-navbar-theme="dark">
        <EventsHeroLogo listType="past" />
      </div>
      <div className="bg-[#f9f4ec] text-[#1a1410]" data-navbar-theme="light">
        <EventsList
          events={eventsWithTickets}
          listType="past"
          enableLoadMore
          initialVisibleCount={20}
          loadMoreCount={20}
        />
        <RentVenue />
      </div>
    </>
  );
}
