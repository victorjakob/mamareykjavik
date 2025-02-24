import { supabase } from "@/lib/supabase";
import ManageEvents from "@/app/components/admin/ManageEvents";

export default async function ManageEventsPage() {
  const now = new Date().toISOString();

  // Fetch all events (both past and upcoming)
  const { data: eventsData, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  if (eventsError) {
    throw eventsError;
  }

  // Fetch ticket counts for each event
  const eventsWithTickets = await Promise.all(
    eventsData.map(async (event) => {
      const { count, error: ticketsError } = await supabase
        .from("tickets")
        .select("*", { count: "exact" })
        .eq("event_id", event.id)
        .in("status", ["paid", "door"]);

      if (ticketsError) throw ticketsError;

      return {
        ...event,
        ticketCount: count || 0,
        isPast: new Date(event.date) < new Date(now),
      };
    })
  );

  return <ManageEvents initialEvents={eventsWithTickets} />;
}
