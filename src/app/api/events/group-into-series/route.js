import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

/**
 * POST /api/events/group-into-series
 *
 * Backfill helper: take N existing events that already exist as separate
 * rows (e.g. the current weekly Qi Gong sessions) and bind them under a
 * brand-new event_series row. After this, mama.is/events/<seriesSlug>
 * starts working as the canonical, persistent ad URL for the whole group.
 *
 * Body:
 *   {
 *     name:              string  (display name of the series)
 *     slug:              string  (URL slug — must not collide w/ events.slug)
 *     recurrence_label?: string
 *     event_ids:         string[] (UUIDs of events to bind)
 *   }
 *
 * Idempotency note: if any of the selected events already have a series_id,
 * we still rebind them — this lets admins migrate events between series if
 * they need to. Per the user's request the canonical action here is
 * "create a new series from these events", so the action is destructive
 * to any prior series_id on those rows by design.
 */

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const supabase = createServerSupabase();
  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }
  if (session.user?.role !== "admin") {
    return new Response(
      JSON.stringify({ message: "Admin role required" }),
      { status: 403 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ message: "Invalid JSON" }), {
      status: 400,
    });
  }

  const { name, slug, recurrence_label, event_ids } = body || {};
  if (!name || typeof name !== "string") {
    return new Response(JSON.stringify({ message: "name is required" }), {
      status: 400,
    });
  }
  const cleanSlug = slugify(slug || name);
  if (!cleanSlug) {
    return new Response(
      JSON.stringify({ message: "slug must contain at least one letter or number" }),
      { status: 400 }
    );
  }
  if (!Array.isArray(event_ids) || event_ids.length < 1) {
    return new Response(
      JSON.stringify({ message: "Pick at least one event to group" }),
      { status: 400 }
    );
  }

  // Slug collision check across both namespaces — events and event_series
  // share /events/<slug>, so we have to look in both tables.
  const { data: clashingEvent } = await supabase
    .from("events")
    .select("id")
    .eq("slug", cleanSlug)
    .maybeSingle();
  if (clashingEvent) {
    return new Response(
      JSON.stringify({
        message: `An event already uses the URL "${cleanSlug}". Pick a different slug.`,
      }),
      { status: 409 }
    );
  }
  const { data: clashingSeries } = await supabase
    .from("event_series")
    .select("id")
    .eq("slug", cleanSlug)
    .maybeSingle();
  if (clashingSeries) {
    return new Response(
      JSON.stringify({
        message: `A series already uses the URL "${cleanSlug}". Pick a different slug.`,
      }),
      { status: 409 }
    );
  }

  // Pull a representative event so we can copy useful defaults (image,
  // description, etc.) onto the new series row. We pick the soonest
  // upcoming one for freshness, falling back to the most recent past one.
  const { data: events } = await supabase
    .from("events")
    .select("id, name, slug, date, image, description, shortdescription, location, host, host_secondary, price, duration, facebook_link, payment, has_sliding_scale, sliding_scale_min, sliding_scale_max, sliding_scale_suggested")
    .in("id", event_ids);

  if (!events || events.length === 0) {
    return new Response(
      JSON.stringify({ message: "None of the selected events were found" }),
      { status: 404 }
    );
  }

  const nowIso = new Date().toISOString();
  const sortedByFreshness = [...events].sort((a, b) => {
    const aFuture = new Date(a.date) >= new Date(nowIso);
    const bFuture = new Date(b.date) >= new Date(nowIso);
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;
    // Both future: ascending. Both past: descending.
    if (aFuture && bFuture) return new Date(a.date) - new Date(b.date);
    return new Date(b.date) - new Date(a.date);
  });
  const template = sortedByFreshness[0];

  const seriesRow = {
    slug: cleanSlug,
    name,
    shortdescription: template.shortdescription || null,
    description: template.description || null,
    image: template.image || null,
    location: template.location || null,
    host: template.host || null,
    host_secondary: template.host_secondary || null,
    default_price: template.price || null,
    default_duration: template.duration || null,
    recurrence_label: recurrence_label || null,
    facebook_link: template.facebook_link || null,
    payment: template.payment || null,
    has_sliding_scale: template.has_sliding_scale || false,
    sliding_scale_min: template.sliding_scale_min || null,
    sliding_scale_max: template.sliding_scale_max || null,
    sliding_scale_suggested: template.sliding_scale_suggested || null,
    hosting_wl_policy_agreed: true,
    is_active: true,
    created_by: session.user?.email || null,
  };

  const { data: createdSeries, error: seriesError } = await supabase
    .from("event_series")
    .insert(seriesRow)
    .select()
    .single();
  if (seriesError) {
    return new Response(
      JSON.stringify({ message: `Could not create series: ${seriesError.message}` }),
      { status: 500 }
    );
  }

  // Bind every selected event to the new series row.
  const { error: bindError } = await supabase
    .from("events")
    .update({ series_id: createdSeries.id })
    .in("id", events.map((e) => e.id));
  if (bindError) {
    // Roll back the series row to avoid leaving an orphan parent.
    await supabase.from("event_series").delete().eq("id", createdSeries.id);
    return new Response(
      JSON.stringify({
        message: `Could not bind events to series: ${bindError.message}`,
      }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({
      series: createdSeries,
      bound_event_count: events.length,
      ad_url: `https://mama.is/events/${createdSeries.slug}`,
    }),
    { status: 200 }
  );
}
