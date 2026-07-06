import { createServerSupabaseComponent } from "@/util/supabase/serverComponent";
import AdminEventManagerWrapper from "@/app/admin/manage-events/AdminEventManagerWrapper";

export const dynamic = "force-dynamic";

function friendlyLoadMessage(err) {
  const raw = err instanceof Error ? err.message : String(err);
  if (/fetch failed|Failed to fetch|ECONNREFUSED|ENOTFOUND/i.test(raw)) {
    return "Could not reach the database. Check your network, VPN, and Supabase URL / keys in env.";
  }
  return raw || "Something went wrong while loading events.";
}

export default async function ManageEventsPage() {
  const now = new Date().toISOString();
  let eventsWithTickets = [];
  let serverLoadError = null;

  try {
    const supabase = await createServerSupabaseComponent();
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (eventsError) {
      serverLoadError = eventsError.message || "Could not load events.";
    } else {
      // Count sold tickets per event. Two past bugs to avoid here:
      //   1. Don't filter with `.in("event_id", allIds)` — with 300+ events
      //      the URL blows past the request-size limit and the whole query
      //      fails (which silently zeroed every count).
      //   2. Don't fetch in one go — PostgREST caps responses at 1000 rows,
      //      and we have more active tickets than that. Page through instead.
      const ticketCountByEventId = new Map();
      if ((eventsData || []).length > 0) {
        const PAGE = 1000;
        for (let fromRow = 0; ; fromRow += PAGE) {
          const { data: ticketsData, error: ticketsError } = await supabase
            .from("tickets")
            .select("event_id, quantity")
            .in("status", ["paid", "door"])
            .order("id", { ascending: true })
            .range(fromRow, fromRow + PAGE - 1);

          if (ticketsError) {
            console.warn("[ManageEventsPage] tickets query:", ticketsError.message);
            break;
          }
          for (const ticket of ticketsData || []) {
            const current = ticketCountByEventId.get(ticket.event_id) || 0;
            ticketCountByEventId.set(ticket.event_id, current + (ticket.quantity || 0));
          }
          if (!ticketsData || ticketsData.length < PAGE) break;
        }
      }

      eventsWithTickets = (eventsData || []).map((event) => ({
        ...event,
        ticketCount: ticketCountByEventId.get(event.id) || 0,
        isPast: new Date(event.date) < new Date(now),
      }));
    }
  } catch (e) {
    console.error("[ManageEventsPage]", e);
    serverLoadError = friendlyLoadMessage(e);
  }

  return (
    <AdminEventManagerWrapper
      initialEvents={eventsWithTickets}
      serverLoadError={serverLoadError}
    />
  );
}
