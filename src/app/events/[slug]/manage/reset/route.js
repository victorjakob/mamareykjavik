import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  resolveEventAccess,
  eventCookieName,
  EVENT_COOKIE_MAX_AGE,
} from "@/lib/eventAccess";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

// Regenerate the event's manage token. Any existing link or cookie carrying
// the old token stops working immediately (access checks compare the live
// value). The caller — who just proved access — is re-issued the fresh cookie
// so they stay in.
export async function POST(req, { params }) {
  const { slug } = await params;

  const access = await resolveEventAccess(slug, {});
  if (access.notFound) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  if (!access.allowed) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const newToken = crypto.randomBytes(24).toString("hex");
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("events")
    .update({ manage_token: newToken })
    .eq("id", access.event.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const origin = new URL(req.url).origin;
  const link = `${origin}/events/${slug}/manage/enter?k=${newToken}`;

  const res = NextResponse.json({ token: newToken, link });
  res.cookies.set(eventCookieName(access.event.id), newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: EVENT_COOKIE_MAX_AGE,
  });
  return res;
}
