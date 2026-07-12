import Event from "@/app/events/[slug]/Event";
import Series from "@/app/events/[slug]/Series";
import { createServerSupabaseComponent } from "@/util/supabase/serverComponent";
import {
  calculateTicketsSold,
  isEventSoldOut,
} from "@/util/event-capacity-util";
import { notFound, redirect } from "next/navigation";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

// Availability (upcoming sessions, sold-out state, ticket counts) must never
// be served stale from the data cache — a cached "no upcoming sessions"
// render kept showing on the series page after new dates went on sale.
export const dynamic = "force-dynamic";

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  height: "device-height",
  initialScale: 1.0,
  minimumScale: 1.0,
  maximumScale: 5.0,
  userScalable: "yes",
  interactiveWidget: "resizes-content",
  viewportFit: "cover",
};

// ─── Slug resolver ────────────────────────────────────────────────
// Two slug shapes share /events/[slug]:
//   • Series slug    e.g. "qi-gong"          → render Series view
//   • Instance slug  e.g. "qi-gong-05-12"    → render Event (existing) view
// Series slug is checked first because it's the canonical, ad-friendly URL
// and the create-event API guards against series ↔ event slug collisions.
async function resolveSlug(supabase, slug) {
  const { data: series } = await supabase
    .from("event_series")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (series) return { kind: "series", series };

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (event) return { kind: "event", event };

  return { kind: "none" };
}

// Pull the upcoming instance list for a series, with sold-out calculated.
const INSTANCE_SELECT = `id, name, slug, date, duration, price, capacity, sold_out, location,
       tickets(quantity, status)`;

async function fetchUpcomingInstances(supabase, series) {
  const yesterdayIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Two sources, merged:
  //   1. properly linked instances (series_id FK)
  //   2. orphans matched by slug prefix — the create-event flow has shipped
  //      instances without the FK more than once, which made this page say
  //      "No upcoming sessions" while tickets were on sale. Always querying
  //      orphans (not just when the linked list is empty) matters: a linked
  //      -but-already-ended session must not mask an unlinked future one.
  // The daily cron (/api/cron/series-integrity) re-links orphans in the DB;
  // this keeps the public page truthful in the meantime.
  const [linkedRes, orphanRes] = await Promise.all([
    supabase
      .from("events")
      .select(INSTANCE_SELECT)
      .eq("series_id", series.id)
      .gte("date", yesterdayIso),
    series.slug
      ? supabase
          .from("events")
          .select(INSTANCE_SELECT)
          .is("series_id", null)
          .like("slug", `${series.slug}-%`)
          .gte("date", yesterdayIso)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (linkedRes.error) {
    console.error("Error fetching series instances:", linkedRes.error);
  }
  if (orphanRes.error) {
    console.error("Error fetching orphan series instances:", orphanRes.error);
  }
  if (orphanRes.data?.length) {
    console.warn(
      `[series] ${orphanRes.data.length} orphan instance(s) matched by slug prefix for series "${series.slug}" — series_id missing in DB`
    );
  }

  const seen = new Set();
  const rows = [...(linkedRes.data || []), ...(orphanRes.data || [])]
    .filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const now = Date.now();
  return rows
    .filter((inst) => {
      const start = new Date(inst.date).getTime();
      const durationMs = (inst.duration || 2) * 60 * 60 * 1000;
      return start + durationMs > now;
    })
    .map((inst) => {
      const ticketsSold = calculateTicketsSold(inst.tickets || []);
      return {
        ...inst,
        ticketsSold,
        sold_out: isEventSoldOut(inst, ticketsSold),
      };
    });
}

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const language = await getLocaleFromHeaders();
    const pathname = `/events/${slug}`;
    const alternates = alternatesFor({ locale: language, pathname, translated: true });

    const supabase = await createServerSupabaseComponent();
    const resolved = await resolveSlug(supabase, slug);

    const defaultDescription =
      language === "is"
        ? "Skoðaðu upplýsingar um viðburð og tryggðu þér sæti hjá Mama Reykjavík & White Lotus."
        : "View details and book your spot for this special event at Mama Reykjavik & White Lotus.";

    const titlePrefix = language === "is" ? "Viðburður" : "Event";
    const fallbackName = language === "is" ? "Upplýsingar" : "Details";

    const baseImage =
      "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/whitelotusbanner.jpg";

    let name = fallbackName;
    let description = defaultDescription;
    let image = baseImage;

    if (resolved.kind === "series") {
      name = resolved.series.name || fallbackName;
      description = resolved.series.shortdescription || resolved.series.description || defaultDescription;
      image = resolved.series.image || baseImage;
    } else if (resolved.kind === "event") {
      name = resolved.event.name || fallbackName;
      description = resolved.event.description || defaultDescription;
      image = resolved.event.image || baseImage;
    }

    const formatted = formatMetadata({
      title: `${name} | Mama Reykjavik`,
      description,
    });

    return {
      title: formatted.title,
      description: formatted.description,
      alternates,
      openGraph: {
        title: `${titlePrefix}: ${name} | White Lotus & Mama`,
        description,
        url: alternates.canonical,
        images: [{ url: image, width: 1200, height: 630, alt: name }],
        type: "website",
        siteName: "Mama Reykjavik",
        locale: ogLocale(language),
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} | Mama Reykjavik`,
        description,
        images: [image],
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
  const resolved = await resolveSlug(supabase, slug);

  // ── Series branch ─────────────────────────────────────────────
  if (resolved.kind === "series") {
    const instances = await fetchUpcomingInstances(supabase, resolved.series);

    // EventSeries JSON-LD with nested upcoming sub-events. This tells
    // Google "this is one ongoing program with these upcoming dates"
    // — far better for SEO than a graveyard of past-instance pages.
    const seriesSchema = {
      "@context": "https://schema.org",
      "@type": "EventSeries",
      name: resolved.series.name,
      description: resolved.series.description,
      image: resolved.series.image,
      url: `https://mama.is/events/${resolved.series.slug}`,
      organizer: {
        "@type": "Organization",
        name: "Mama Reykjavik",
        url: "https://mama.is",
      },
      location: {
        "@type": "Place",
        name: "Mama Reykjavik / White Lotus",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Bankastræti 2",
          addressLocality: "Reykjavik",
          postalCode: "101",
          addressCountry: "IS",
        },
      },
      subEvent: instances.map((inst) => ({
        "@type": "Event",
        name: inst.name,
        startDate: inst.date,
        url: `https://mama.is/events/${inst.slug}`,
        eventStatus: inst.sold_out
          ? "https://schema.org/EventSoldOut"
          : "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: "Mama Reykjavik / White Lotus",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Bankastræti 2",
            addressLocality: "Reykjavik",
            postalCode: "101",
            addressCountry: "IS",
          },
        },
      })),
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seriesSchema) }}
        />
        <Series series={resolved.series} instances={instances} />
      </>
    );
  }

  // ── Single-event branch (existing flow, unchanged) ────────────
  if (resolved.kind === "event") {
    const event = resolved.event;

    // If this event belongs to a series AND it has already ended,
    // don't 404 — bounce to the series URL so any old ad/email link
    // still lands the visitor on something useful (the next session).
    const eventStart = new Date(event.date);
    const eventEnd = new Date(
      eventStart.getTime() + (event.duration || 2) * 60 * 60 * 1000
    );
    if (event.series_id && eventEnd <= new Date()) {
      const { data: parent } = await supabase
        .from("event_series")
        .select("slug, is_active")
        .eq("id", event.series_id)
        .maybeSingle();
      if (parent?.slug && parent.is_active !== false) {
        redirect(`/events/${parent.slug}`);
      }
    }

    if (!eventStart || Number.isNaN(eventStart.getTime())) {
      return notFound();
    }

    const { data: ticketVariants } = await supabase
      .from("ticket_variants")
      .select("*")
      .eq("event_id", event.id);

    const { data: tickets } = await supabase
      .from("tickets")
      .select("quantity, status")
      .eq("event_id", event.id);

    const ticketsSold = calculateTicketsSold(tickets || []);
    const soldOut = isEventSoldOut(event, ticketsSold);

    const eventWithVariants = {
      ...event,
      ticket_variants: ticketVariants || [],
      sold_out: soldOut,
      ticketsSold,
    };

    const eventSchema = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.name,
      description: event.description,
      image: event.image,
      startDate: event.date,
      location: {
        "@type": "Place",
        name: "Mama Reykjavik / White Lotus",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Bankastræti 2",
          addressLocality: "Reykjavik",
          postalCode: "101",
          addressCountry: "IS",
        },
      },
      organizer: {
        "@type": "Organization",
        name: "Mama Reykjavik",
        url: "https://mama.is",
      },
      url: `https://mama.is/events/${event.slug}`,
      eventStatus: soldOut
        ? "https://schema.org/EventSoldOut"
        : "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      ...(ticketVariants?.length > 0 && {
        offers: ticketVariants.map((v) => ({
          "@type": "Offer",
          name: v.name,
          price: v.price,
          priceCurrency: "ISK",
          availability: soldOut
            ? "https://schema.org/SoldOut"
            : "https://schema.org/InStock",
          url: `https://mama.is/events/${event.slug}`,
        })),
      }),
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
        />
        <Event event={eventWithVariants} />
      </>
    );
  }

  return notFound();
}
