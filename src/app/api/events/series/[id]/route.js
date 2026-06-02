import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

const EVENT_TEMPLATE_COLUMNS = [
  "id",
  "name",
  "shortdescription",
  "description",
  "duration",
  "location",
  "price",
  "early_bird_price",
  "early_bird_date",
  "has_sliding_scale",
  "sliding_scale_min",
  "sliding_scale_max",
  "sliding_scale_suggested",
  "capacity",
  "facebook_link",
  "image",
  "payment",
  "host",
  "host_secondary",
  "series_id",
  "date",
].join(",");

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const json = (body, init) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });

const formatDateKey = (dateValue) => {
  const date = new Date(dateValue);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${month}-${day}`;
};

async function getUniqueEventSlug(supabase, baseSlug, usedSlugs) {
  for (let suffix = 0; suffix < 1000; suffix += 1) {
    const candidate = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;
    if (usedSlugs.has(candidate)) continue;

    const { data: eventMatch, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (eventError) throw eventError;
    if (eventMatch) continue;

    const { data: seriesMatch, error: seriesError } = await supabase
      .from("event_series")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (seriesError) throw seriesError;
    if (seriesMatch) continue;

    usedSlugs.add(candidate);
    return candidate;
  }
  throw new Error("Unable to generate a unique event slug");
}

function normalizeFutureDates(values) {
  if (!Array.isArray(values)) return [];
  const seen = new Set();
  const now = Date.now();
  return values
    .map((value) => {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
    })
    .filter((value) => {
      if (!value || seen.has(value)) return false;
      if (new Date(value).getTime() <= now) return false;
      seen.add(value);
      return true;
    })
    .sort((a, b) => new Date(a) - new Date(b));
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return { error: json({ message: "Unauthorized" }, { status: 401 }) };
  if (session.user?.role !== "admin") {
    return { error: json({ message: "Admin role required" }, { status: 403 }) };
  }
  return { session };
}

async function loadSeries(supabase, id) {
  const { data: series, error } = await supabase
    .from("event_series")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return series;
}

async function loadTemplateEvent(supabase, seriesId, requestedTemplateId) {
  if (requestedTemplateId) {
    const { data, error } = await supabase
      .from("events")
      .select(EVENT_TEMPLATE_COLUMNS)
      .eq("id", requestedTemplateId)
      .eq("series_id", seriesId)
      .maybeSingle();
    if (error) throw error;
    if (data) return data;
  }

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_TEMPLATE_COLUMNS)
    .eq("series_id", seriesId)
    .order("date", { ascending: false })
    .limit(1);
  if (error) throw error;
  return Array.isArray(data) ? data[0] : null;
}

function eventFromTemplate({ template, series, date, slug, sessionEmail }) {
  return {
    name: template?.name || series.name,
    shortdescription: template?.shortdescription || series.shortdescription || "",
    description: template?.description || series.description || "",
    duration: template?.duration ?? series.default_duration ?? 2,
    location: template?.location || series.location || "Bankastræti 2, 101 Reykjavik",
    price: template?.price ?? series.default_price ?? 0,
    early_bird_price: template?.early_bird_price ?? null,
    early_bird_date: template?.early_bird_date ?? null,
    has_sliding_scale:
      typeof template?.has_sliding_scale === "boolean"
        ? template.has_sliding_scale
        : Boolean(series.has_sliding_scale),
    sliding_scale_min: template?.sliding_scale_min ?? series.sliding_scale_min ?? null,
    sliding_scale_max: template?.sliding_scale_max ?? series.sliding_scale_max ?? null,
    sliding_scale_suggested:
      template?.sliding_scale_suggested ?? series.sliding_scale_suggested ?? null,
    capacity: template?.capacity ?? null,
    facebook_link: template?.facebook_link || series.facebook_link || null,
    image: template?.image || series.image || null,
    payment: template?.payment || series.payment || "online",
    host: template?.host || series.host || sessionEmail || "team@whitelotus.is",
    host_secondary: template?.host_secondary || series.host_secondary || null,
    date,
    slug,
    series_id: series.id,
    created_at: new Date().toISOString(),
  };
}

export async function POST(request, context) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const params = context?.params ? await context.params : {};
  const seriesId = params?.id;
  if (!seriesId) return json({ message: "Missing series id" }, { status: 400 });

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ message: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createServerSupabase();

  try {
    const series = await loadSeries(supabase, seriesId);
    if (!series) return json({ message: "Series not found" }, { status: 404 });

    if (body?.action === "attachEvents") {
      const eventIds = Array.isArray(body.event_ids)
        ? Array.from(new Set(body.event_ids.filter(Boolean)))
        : [];
      if (eventIds.length === 0) {
        return json({ message: "Choose at least one event to attach" }, { status: 400 });
      }

      const { data: foundEvents, error: eventError } = await supabase
        .from("events")
        .select("id, series_id")
        .in("id", eventIds);
      if (eventError) throw eventError;
      if (!foundEvents?.length) {
        return json({ message: "No selected events were found" }, { status: 404 });
      }

      const idsToUpdate = foundEvents
        .filter((event) => event.series_id !== series.id)
        .map((event) => event.id);
      if (idsToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from("events")
          .update({ series_id: series.id })
          .in("id", idsToUpdate);
        if (updateError) throw updateError;
      }

      return json({
        series,
        attached_event_count: idsToUpdate.length,
        already_attached_count: foundEvents.length - idsToUpdate.length,
      });
    }

    if (body?.action === "createSessions") {
      const dates = normalizeFutureDates(body.dates);
      if (dates.length === 0) {
        return json(
          { message: "Add at least one future date/time for the new sessions" },
          { status: 400 }
        );
      }

      const template = await loadTemplateEvent(
        supabase,
        series.id,
        body.template_event_id || null
      );
      if (!template && (!series.shortdescription || !series.description)) {
        return json(
          {
            message:
              "This series has no event template yet. Attach an existing event first, then create more sessions.",
          },
          { status: 400 }
        );
      }

      const existingForDates = await supabase
        .from("events")
        .select("id,date")
        .eq("series_id", series.id)
        .in("date", dates);
      if (existingForDates.error) throw existingForDates.error;
      const occupiedDates = new Set((existingForDates.data || []).map((event) => event.date));
      const datesToCreate = dates.filter((date) => !occupiedDates.has(date));
      if (datesToCreate.length === 0) {
        return json(
          { message: "Those date/times already exist in this series" },
          { status: 409 }
        );
      }

      const usedSlugs = new Set();
      const base = slugify(series.slug || series.name);
      const eventsToInsert = [];
      for (const date of datesToCreate) {
        const slug = await getUniqueEventSlug(
          supabase,
          `${base}-${formatDateKey(date)}`,
          usedSlugs
        );
        eventsToInsert.push(
          eventFromTemplate({
            template,
            series,
            date,
            slug,
            sessionEmail: auth.session.user?.email,
          })
        );
      }

      const { data: createdEvents, error: insertError } = await supabase
        .from("events")
        .insert(eventsToInsert)
        .select();
      if (insertError) throw insertError;

      if (template?.id) {
        const { data: variants, error: variantsError } = await supabase
          .from("ticket_variants")
          .select("*")
          .eq("event_id", template.id);
        if (variantsError) throw variantsError;
        if (variants?.length && createdEvents?.length) {
          const variantsToInsert = createdEvents.flatMap((event) =>
            variants.map(({ id, event_id, created_at, ...variant }) => ({
              ...variant,
              event_id: event.id,
              created_at: new Date().toISOString(),
            }))
          );
          const { error: variantInsertError } = await supabase
            .from("ticket_variants")
            .insert(variantsToInsert);
          if (variantInsertError) {
            return json(
              {
                message:
                  "Sessions were created, but ticket variants could not be copied. Edit the new events to add them.",
                created_events: createdEvents,
              },
              { status: 207 }
            );
          }
        }
      }

      return json({
        series,
        created_events: createdEvents || [],
        skipped_existing_count: dates.length - datesToCreate.length,
      });
    }

    return json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[events/series]", error);
    return json(
      { message: error instanceof Error ? error.message : "Series update failed" },
      { status: 500 }
    );
  }
}
