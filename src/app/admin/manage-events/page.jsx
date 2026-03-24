import { createServerSupabaseComponent } from "@/util/supabase/serverComponent";
import AdminEventManagerWrapper from "@/app/admin/manage-events/AdminEventManagerWrapper";

export const dynamic = "force-dynamic";

export default async function ManageEventsPage() {
  const now = new Date().toISOString();

  const supabase = await createServerSupabaseComponent();
  // Fetch all events (both past and upcoming)
  const { data: eventsData, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  if (eventsError) {
    throw eventsError;
  }

  const eventIds = (eventsData || []).map((event) => event.id);
  let ticketCountByEventId = new Map();

  if (eventIds.length > 0) {
    const { data: ticketsData, error: ticketsError } = await supabase
      .from("tickets")
      .select("event_id, quantity")
      .in("event_id", eventIds)
      .in("status", ["paid", "door"]);

    if (ticketsError) {
      throw ticketsError;
    }

    ticketCountByEventId = ticketsData.reduce((map, ticket) => {
      const eventId = ticket.event_id;
      const current = map.get(eventId) || 0;
      map.set(eventId, current + (ticket.quantity || 0));
      return map;
    }, new Map());
  }

  const eventsWithTickets = eventsData.map((event) => ({
    ...event,
    ticketCount: ticketCountByEventId.get(event.id) || 0,
    isPast: new Date(event.date) < new Date(now),
  }));

  return <AdminEventManagerWrapper initialEvents={eventsWithTickets} />;
}
