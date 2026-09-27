// GET /api/events/duplicate-source/[id] — an event's fields for "duplicate
// event" in the create-event form. Admins, or the event's own host /
// secondary host.
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireSession, jsonError } from "@/lib/api/session";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const { data: event, error } = await createServerSupabase()
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return jsonError(error);
  if (!event) return jsonError("Event not found", 404);

  const email = (session.user.email || "").trim().toLowerCase();
  const isHost =
    email &&
    [event.host, event.host_secondary]
      .map((e) => (e || "").trim().toLowerCase())
      .includes(email);
  if (session.user.role !== "admin" && !isHost) return jsonError("Not allowed", 403);

  // eslint-disable-next-line no-unused-vars
  const { manage_token, ...safeEvent } = event;
  return NextResponse.json({ event: safeEvent });
}
