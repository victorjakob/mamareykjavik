import { Suspense } from "react";
import EventManagerWrapper from "@/app/events/manager/EventManagerWrapper";
import { createServerSupabaseComponent } from "@/util/supabase/serverComponent";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/whitelotusbanner.jpg?alt=media&token=ddb5d9ad-25af-4307-b37f-ceaa1b79002a",
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
    return { forbidden: true };
  }

  const { role, email } = session.user;
  if (role !== "admin" && role !== "host") {
    return { forbidden: true, user: { email } };
  }

  // Fetch events using session.user.email
  const { data: eventsData, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .eq("host", session.user.email)
    .order("date", { ascending: true });

  if (eventsError) throw eventsError;

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
      email: session.user.email,
      role: session.user.role, // Role is now accessible here
    },
  };
}

export default async function EventManager() {
  const data = await getEventsData();

  if (data.forbidden) {
    return <NoAccess email={data.user?.email} />;
  }

  return (
    <div className="mt-14 sm:mt-32">
      <Suspense fallback={<LoadingSpinner />}>
        <EventManagerWrapper initialData={data} />
      </Suspense>
    </div>
  );
}
