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
      const eventIds = (eventsData || []).map((event) => event.id);
      let ticketCountByEventId = new Map();

      if (eventIds.length > 0) {
        const { data: ticketsData, error: ticketsError } = await supabase
          .from("tickets")
          .select("event_id, quantity")
          .in("event_id", eventIds)
          .in("status", ["paid", "door"]);

        if (ticketsError) {
          console.warn("[ManageEventsPage] tickets query:", ticketsError.message);
        } else {
          ticketCountByEventId = ticketsData.reduce((map, ticket) => {
            const eventId = ticket.event_id;
            const current = map.get(eventId) || 0;
            map.set(eventId, current + (ticket.quantity || 0));
            return map;
          }, new Map());
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
