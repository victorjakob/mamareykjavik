import { createServerSupabaseComponent } from "@/util/supabase/serverComponent";
import ManageEvents from "@/app/admin/manage-events/ManageEvents";

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

  // Fetch ticket counts for each event
  const eventsWithTickets = await Promise.all(
    eventsData.map(async (event) => {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from("tickets")
        .select("quantity")
        .eq("event_id", event.id)
        .in("status", ["paid", "door"]);

      if (ticketsError) throw ticketsError;

      // Sum up the quantities of all tickets
      const totalTickets = ticketsData.reduce(
        (sum, ticket) => sum + (ticket.quantity || 0),
        0
      );

      return {
        ...event,
        ticketCount: totalTickets,
        isPast: new Date(event.date) < new Date(now),
      };
    })
  );

  return <ManageEvents initialEvents={eventsWithTickets} />;
}
