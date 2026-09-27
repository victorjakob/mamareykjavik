// /api/events/manage/[slug] — load and save an event from the host editor
// (/events/manager/[slug]/edit). Access: logged-in host / secondary host /
// admin, or a valid manage-token cookie — the same rule as the edit page
// itself (lib/eventAccess.js). Replaces the browser reading and writing the
// events / ticket_variants tables directly.

import { NextResponse } from "next/server";
import { resolveEventAccess } from "@/lib/eventAccess";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

// Columns the editor is allowed to change. Anything else in the body
// (id, slug, manage_token, created_by, series_id, …) is ignored.
const EDITABLE = [
  "name",
  "shortdescription",
  "description",
  "date",
  "duration",
  "price",
  "early_bird_price",
  "early_bird_date",
  "early_bird_ticket_limit",
  "has_sliding_scale",
  "sliding_scale_min",
  "sliding_scale_max",
  "sliding_scale_suggested",
  "capacity",
  "image",
  "payment",
  "host",
  "host_secondary",
  "location",
  "facebook_link",
  "community_link",
  "community_link_label",
  "community_link_public",
  "community_link_in_email",
];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function access(params) {
  const { slug } = await params;
  const result = await resolveEventAccess(slug, {});
  if (result.error) return { res: NextResponse.json({ error: result.error }, { status: 500 }) };
  if (result.notFound)
    return { res: NextResponse.json({ error: "Event not found", code: "PGRST116" }, { status: 404 }) };
  if (!result.allowed)
    return { res: NextResponse.json({ error: "Not allowed" }, { status: 403 }) };
  return { event: result.event };
}

export async function GET(req, { params }) {
  const a = await access(params);
  if (a.res) return a.res;

  const supabase = createServerSupabase();
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", a.event.id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: variants, error: vErr } = await supabase
    .from("ticket_variants")
    .select("*")
    .eq("event_id", a.event.id);

  // The editor doesn't need the management secret.
  // eslint-disable-next-line no-unused-vars
  const { manage_token, ...safeEvent } = event;
  return NextResponse.json({
    event: safeEvent,
    variants: variants || [],
    variantsError: vErr ? vErr.message : null,
  });
}

export async function PATCH(req, { params }) {
  const a = await access(params);
  if (a.res) return a.res;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates = {};
  for (const key of EDITABLE) {
    if (body.updates && Object.prototype.hasOwnProperty.call(body.updates, key)) {
      updates[key] = body.updates[key];
    }
  }

  const supabase = createServerSupabase();
  const eventId = a.event.id;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("events").update(updates).eq("id", eventId);
    if (error) {
      return NextResponse.json(
        { error: error.message, code: error.code, stage: "event" },
        { status: 400 }
      );
    }
  }

  // Ticket variants: keep existing rows (so sold tickets keep pointing at
  // them), update changed ones, add new ones, remove the ones taken out.
  let variantsError = null;
  if (Array.isArray(body.variants)) {
    try {
      const { data: existing, error: exErr } = await supabase
        .from("ticket_variants")
        .select("id")
        .eq("event_id", eventId);
      if (exErr) throw exErr;
      const existingIds = new Set((existing || []).map((v) => v.id));
      const keepIds = new Set();

      for (const v of body.variants) {
        const row = {
          name: v.name,
          price: v.price,
          capacity: v.capacity ?? null,
          meta: v.meta ?? {},
        };
        if (v.id && UUID_RE.test(String(v.id)) && existingIds.has(v.id)) {
          keepIds.add(v.id);
          const { error } = await supabase
            .from("ticket_variants")
            .update(row)
            .eq("id", v.id)
            .eq("event_id", eventId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("ticket_variants")
            .insert({ ...row, event_id: eventId, created_at: new Date().toISOString() });
          if (error) throw error;
        }
      }

      const removed = [...existingIds].filter((id) => !keepIds.has(id));
      if (removed.length > 0) {
        const { error } = await supabase
          .from("ticket_variants")
          .delete()
          .in("id", removed)
          .eq("event_id", eventId);
        // A variant that already has tickets can't be deleted (foreign key);
        // that's fine — it just stays.
        if (error) console.warn("[events/manage] variant delete skipped:", error.message);
      }
    } catch (err) {
      console.error("[events/manage] variants error:", err);
      variantsError = err.message || "Variant update failed";
    }
  }

  return NextResponse.json({ success: true, variantsError });
}
