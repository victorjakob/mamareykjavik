// /private-session/admin — single chronological "Upcoming sessions" list,
// with a Locations-needed strip pinned at top whenever any booking in the
// next 14 days is still missing an actual address.
// This is the screen Mama lives in: it's what the escalation email links to.

import {
  listBookingsNeedingLocation,
  listUpcomingBookings,
} from "../_lib/admin-data";
import TodayClient from "./TodayClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [needLocation, upcoming] = await Promise.all([
    listBookingsNeedingLocation(),
    listUpcomingBookings(), // default 365-day window — effectively "all upcoming"
  ]);

  return <TodayClient needLocation={needLocation} upcoming={upcoming} />;
}
