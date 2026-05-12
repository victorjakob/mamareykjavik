import { Suspense } from "react";
import EventManagerWrapper from "@/app/events/manager/EventManagerWrapper";
import { createServerSupabaseComponent } from "@/util/supabase/serverComponent";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import NoAccess from "./NoAccess";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Event Manager | Mama Reykjavik",
  description:
    "Manage and organize events at Mama Reykjavik & White Lotus. Add, edit, and delete events for your venue.",
  canonical: "https://mama.is/events/manager",
  openGraph: {
    title: "Event Manager | Mama Reykjavik",
    description:
      "Administrative interface for managing events at Mama Reykjavik & White Lotus.",
    url: "https://mama.is/events/manager",
    images: [
      {
        url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/whitelotusbanner.jpg",
        width: 1200,
        height: 630,
        alt: "Mama Reykjavik Event Management",
      },
    ],
    type: "website",
  },
};

async function getEventsData() {
  const supabase = await createServerSupabaseComponent();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { loginRequired: true };
  }

  const { role } = session.user;
  const email = String(session.user.email || "").trim().toLowerCase();
  if (!email) {
    return { forbidden: true };
  }

  // Access is based on the event manager email. If a user is listed as host or
  // co-host on any event, we let them in and promote their stored role to host.
  const { data: eventsData, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .or(`host.ilike.${email},host_secondary.ilike.${email}`)
    .order("date", { ascending: true });

  if (eventsError) throw eventsError;

  const managesAnyEvent = eventsData.length > 0;
  const isAdmin = role === "admin";
  const isHost = role === "host" || managesAnyEvent;

  if (!isAdmin && !isHost) {
    return { forbidden: true, user: { email } };
  }

  if (role !== "admin" && role !== "host" && managesAnyEvent && session.user.id) {
    await supabase
      .from("users")
      .update({ role: "host" })
      .eq("id", session.user.id);
  }

  // Fetch ticket counts
  const eventsWithTickets = await Promise.all(
    eventsData.map(async (event) => {
      const { data: ticketData, error: ticketsError } = await supabase
        .from("tickets")
        .select("quantity")
        .eq("event_id", event.id)
        .in("status", ["paid", "door", "cash", "card", "transfer"]);

      if (ticketsError) throw ticketsError;

      const ticketCount = ticketData.reduce(
        (sum, ticket) => sum + (ticket.quantity || 0),
        0
      );

      return {
        ...event,
        ticketCount,
      };
    })
  );

  return {
    events: eventsWithTickets,
    user: {
      id: session.user.id,
      email,
      role: isAdmin ? "admin" : "host",
    },
  };
}

export default async function EventManager() {
  const data = await getEventsData();

  if (data.loginRequired) {
    redirect("/auth?callbackUrl=%2Fevents%2Fmanager");
  }

  if (data.forbidden) {
    return <NoAccess email={data.user?.email} />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EventManagerWrapper initialData={data} />
    </Suspense>
  );
}
