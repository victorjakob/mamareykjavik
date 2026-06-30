import { redirect } from "next/navigation";

// Retired: the standalone attendance page is replaced by the Attendees tab in
// the per-event hub (/events/[slug]/manage). Redirect any old links or
// bookmarks there so nothing breaks.
export const dynamic = "force-dynamic";

export default async function AttendanceRedirect({ params }) {
  const { slug } = await params;
  redirect(`/events/${slug}/manage`);
}
