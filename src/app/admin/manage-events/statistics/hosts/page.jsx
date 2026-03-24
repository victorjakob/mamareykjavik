import HostsStatisticsClient from "./HostsStatisticsClient";
import { createServerSupabaseComponent } from "@/util/supabase/serverComponent";

export const dynamic = "force-dynamic";

export default async function HostStatisticsPage() {
  const supabase = await createServerSupabaseComponent();

  const { data: eventsData, error: eventsError } = await supabase
    .from("events")
    .select("id,name,slug,date,host,host_secondary")
    .order("date", { ascending: false });

  if (eventsError) {
    throw eventsError;
  }

  const eventIds = (eventsData || []).map((event) => event.id);
  const hostEmails = Array.from(
    new Set(
      (eventsData || [])
        .flatMap((event) => [event.host, event.host_secondary])
        .filter(Boolean)
        .map((email) => String(email).trim().toLowerCase())
    )
  );

  let ticketsData = [];
  let paymentsData = [];
  let usersData = [];

  if (eventIds.length > 0) {
    const [
      { data: tickets, error: ticketsError },
      { data: payments, error: paymentsError },
      { data: users, error: usersError },
    ] = await Promise.all([
      supabase
        .from("tickets")
        .select("id,event_id,status,quantity,total_price,created_at")
        .in("event_id", eventIds),
      supabase
        .from("event-payments")
        .select("id,event_id,amount,details,created_at")
        .in("event_id", eventIds)
        .order("created_at", { ascending: false }),
      hostEmails.length > 0
        ? supabase.from("users").select("email,name").in("email", hostEmails)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (ticketsError) throw ticketsError;
    if (paymentsError) throw paymentsError;
    if (usersError) throw usersError;

    ticketsData = tickets || [];
    paymentsData = payments || [];
    usersData = users || [];
  }

  return (
    <HostsStatisticsClient
      initialEvents={eventsData || []}
      initialTickets={ticketsData}
      initialPayments={paymentsData}
      initialHostUsers={usersData}
    />
  );
}
