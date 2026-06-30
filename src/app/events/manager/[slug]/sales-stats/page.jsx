import { redirect } from "next/navigation";

// Retired: replaced by the Ticket sales tab in the per-event hub
// (/events/[slug]/manage). Redirect any old links or bookmarks there.
export const dynamic = "force-dynamic";

export default async function SalesStatsRedirect({ params }) {
  const { slug } = await params;
  redirect(`/events/${slug}/manage`);
}
