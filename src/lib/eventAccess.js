// Unified access control for event management.
//
// Answers one question — "may this caller manage this event?" — from EITHER
// of two paths:
//   1. a logged-in host / secondary host / admin (the same rule the door
//      system already uses in api/events/gatekeeper/_lib.js), or
//   2. a valid per-event manage token, passed as ?k=<token> on the first hit
//      and thereafter stored in an httpOnly cookie (set by the manage page).
//
// The token is compared against the event's CURRENT manage_token, so resetting
// the token immediately revokes every old link and cookie. This helper is
// read-only — it never sets cookies or mutates anything.

import crypto from "crypto";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

// Cookie that caches the manage token for a single event, keeping the secret
// out of the URL (no browser history / referrer leakage) after the first hit.
export function eventCookieName(eventId) {
  return `evt_mt_${eventId}`;
}

// How long the convenience cookie lasts. The DB token stays permanent; this
// only controls how often a returning host re-clicks their email link.
export const EVENT_COOKIE_MAX_AGE = 90 * 24 * 60 * 60; // 90 days

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

const EVENT_FIELDS =
  "id, name, slug, date, duration, price, payment, capacity, host, host_secondary, image, sold_out, series_id, manage_token";

// resolveEventAccess(slug, { queryToken }) ->
//   { notFound: true }
//   { error: "..." }
//   { allowed: true,  mode: "session" | "token", event, session }
//   { allowed: false, event, session }
export async function resolveEventAccess(slug, { queryToken = null } = {}) {
  const supabase = createServerSupabase();

  const { data: event, error } = await supabase
    .from("events")
    .select(EVENT_FIELDS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!event) return { notFound: true };

  // 1) Session path — host, secondary host, or admin.
  const session = await getServerSession(authOptions);
  const email = (session?.user?.email || "").trim().toLowerCase();
  const role = session?.user?.role || "guest";
  const host = (event.host || "").trim().toLowerCase();
  const secondary = (event.host_secondary || "").trim().toLowerCase();

  const sessionAllowed =
    !!email && (role === "admin" || email === host || email === secondary);

  if (sessionAllowed) {
    return { allowed: true, mode: "session", event, session };
  }

  // 2) Token path — explicit ?k= first, otherwise the cookie we set earlier.
  let token = queryToken;
  if (!token) {
    const jar = await cookies();
    token = jar.get(eventCookieName(event.id))?.value || null;
  }

  if (token && event.manage_token && safeEqual(token, event.manage_token)) {
    return { allowed: true, mode: "token", event, session: session || null };
  }

  return { allowed: false, event, session: session || null };
}
