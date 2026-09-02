import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import {
  calculateTicketsSold,
  isEventSoldOut,
  getRemainingCapacity,
} from "@/util/event-capacity-util";
import { parseEventDate } from "@/lib/eventTime";

/**
 * Public, read-only feed of upcoming events for vibra (Voice of Vibration).
 *
 * Rule: an event belongs on Vibra when its host OR co-host is the Vibra
 * account. Events are created and sold here on mama.is; Vibra only reads.
 *
 * Returns public fields only — no host emails, no manage tokens.
 * Cached at the edge for 5 minutes.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VIBRA_HOST = process.env.VIBRA_HOST_EMAIL || "vibraiceland@gmail.com";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://mama.is";

export async function GET() {
  try {
    const supabase = createServerSupabase();
    const from = new Date();
    from.setHours(from.getHours() - 6); // keep an event visible while it runs

    const { data, error } = await supabase
      .from("events")
      .select(
        `
        id, slug, name, shortdescription, description, date, duration, image,
        price, early_bird_price, early_bird_date, early_bird_ticket_limit,
        has_sliding_scale, sliding_scale_min, sliding_scale_max, sliding_scale_suggested,
        capacity, sold_out, location, series_id,
        tickets(quantity, status),
        ticket_variants(id, name, price, capacity),
        event_series(slug, name, recurrence_label)
      `
      )
      .or(`host.eq.${VIBRA_HOST},host_secondary.eq.${VIBRA_HOST}`)
      .gte("date", from.toISOString())
      .order("date", { ascending: true });

    if (error) throw error;

    const events = (data || []).map((e) => {
      const ticketsSold = calculateTicketsSold(e.tickets || []);
      const soldOut = isEventSoldOut(e, ticketsSold);
      const remaining = getRemainingCapacity(e, ticketsSold);
      const series = e.event_series || null;
      return {
        id: e.id,
        slug: e.slug,
        url: `${SITE}/events/${e.slug}`,
        name: e.name,
        shortdescription: e.shortdescription,
        description: e.description,
        // Event times are Iceland time; always emit an unambiguous UTC ISO string.
        starts_at: parseEventDate(e.date)?.toISOString() ?? null,
        timezone: "Atlantic/Reykjavik",
        duration_hours: e.duration,
        image: e.image,
        location: e.location,
        currency: "ISK",
        price: e.price,
        early_bird_price: e.early_bird_price,
        early_bird_date: parseEventDate(e.early_bird_date)?.toISOString() ?? null,
        early_bird_ticket_limit: e.early_bird_ticket_limit,
        sliding_scale: e.has_sliding_scale
          ? {
              min: e.sliding_scale_min,
              max: e.sliding_scale_max,
              suggested: e.sliding_scale_suggested,
            }
          : null,
        capacity: e.capacity || null,
        tickets_sold: ticketsSold,
        seats_left: remaining,
        sold_out: soldOut,
        variants: (e.ticket_variants || []).map((v) => ({
          id: v.id,
          name: v.name,
          price: v.price,
          capacity: v.capacity,
        })),
        series: series
          ? {
              slug: series.slug,
              name: series.name,
              recurrence_label: series.recurrence_label,
              url: `${SITE}/events/${series.slug}`,
            }
          : null,
      };
    });

    return NextResponse.json(
      { events, generated_at: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to load vibra events: ${err.message}` },
      { status: 500 }
    );
  }
}
