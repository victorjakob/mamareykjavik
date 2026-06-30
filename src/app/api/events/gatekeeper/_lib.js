// Shared helpers for the Gatekeeper API routes.
//
// Permission model: an event's "door crew" are the admin role, the event
// host (primary email), and the secondary host (host_secondary). All
// mutating routes must pass through resolveGatekeeperContext() and
// require { allowed: true }.
//
// PIN handling: PINs are stored as a sha256 hex string (not a password;
// these rotate per-event and are local-use), never the raw digits.
// The master PIN "2323" always works — verified in verifyPin() and
// not persisted anywhere.

import crypto from "crypto";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import { eventCookieName } from "@/lib/eventAccess";

export const MASTER_PIN = "2323";

export function hashPin(pin) {
  if (!pin) return null;
  return crypto
    .createHash("sha256")
    .update(`gatekeeper:${pin}`)
    .digest("hex");
}

export function verifyPinAgainst(pin, hash) {
  if (!pin || typeof pin !== "string") return false;
  if (pin === MASTER_PIN) return true;
  if (!hash) return false;
  return hashPin(pin) === hash;
}

// Resolves { session, supabase, event, config, allowed } for a given slug.
// Access is granted to an admin/host/secondary-host SESSION, or to a no-login
// holder of the event's manage TOKEN (the httpOnly cookie set by the hub's
// /events/[slug]/manage link), compared against the live token so a reset
// revokes it. Returns { notFound } when the event is missing, and
// { unauthenticated: true } only when there's neither a session nor a token.
export async function resolveGatekeeperContext(slug) {
  const supabase = createServerSupabase();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, name, slug, date, duration, price, host, host_secondary, image, manage_token")
    .eq("slug", slug)
    .maybeSingle();

  if (eventError) {
    return { error: eventError.message };
  }
  if (!event) {
    return { notFound: true };
  }

  const session = await getServerSession(authOptions);
  const email = (session?.user?.email || "").trim().toLowerCase();
  const host = (event.host || "").trim().toLowerCase();
  const secondary = (event.host_secondary || "").trim().toLowerCase();
  const role = session?.user?.role || "guest";

  let allowed =
    !!email &&
    (role === "admin" ||
      (role === "host" && (email === host || email === secondary)) ||
      email === host ||
      email === secondary);

  // No-login path: a valid manage-token cookie for this exact event.
  if (!allowed) {
    const jar = await cookies();
    const token = jar.get(eventCookieName(event.id))?.value || null;
    if (token && event.manage_token && tokenEquals(token, event.manage_token)) {
      allowed = true;
    }
  }

  // Always fetch the config if present — keeps every route consistent.
  const { data: config } = await supabase
    .from("gatekeeper_configs")
    .select("*")
    .eq("event_id", event.id)
    .maybeSingle();

  return {
    session: session || null,
    supabase,
    event,
    config: config || null,
    allowed: !!allowed,
    unauthenticated: !email && !allowed,
  };
}

function tokenEquals(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// Ensures a config row exists for the event and returns it. Useful for
// the initiator screen which may open before the first save.
export async function ensureConfig(supabase, eventId) {
  const { data: existing } = await supabase
    .from("gatekeeper_configs")
    .select("*")
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("gatekeeper_configs")
    .insert({ event_id: eventId })
    .select()
    .single();

  if (error) throw error;
  return created;
}

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function sanitizeMethods(methods) {
  const allowed = new Set(["cash", "transfer", "pos", "exchange"]);
  if (!Array.isArray(methods)) return ["cash"];
  const clean = methods.filter((m) => allowed.has(m));
  return clean.length ? Array.from(new Set(clean)) : ["cash"];
}
