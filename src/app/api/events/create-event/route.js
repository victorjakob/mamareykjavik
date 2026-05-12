import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

const resend = createResend();

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatDateKey = (dateValue) => {
  const date = new Date(dateValue);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${month}-${day}`;
};

const getUniqueSlug = async (supabase, baseSlug, usedSlugs = new Set()) => {
  let suffix = 0;
  while (suffix < 1000) {
    const candidate = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;
    if (usedSlugs.has(candidate)) {
      suffix += 1;
      continue;
    }

    const { data, error } = await supabase
      .from("events")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      usedSlugs.add(candidate);
      return candidate;
    }

    suffix += 1;
  }
  throw new Error("Unable to generate a unique event slug");
};

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const supabase = createServerSupabase();

  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const eventData = await req.json();
    const {
      ticket_variants,
      hosting_wl_policy_agreed,
      dates,
      series,
      ...eventDetails
    } = eventData;

    if (hosting_wl_policy_agreed !== true) {
      return new Response(
        JSON.stringify({
          message:
            "You must agree to the White Lotus hosting terms to create an event.",
        }),
        { status: 400 }
      );
    }

    const eventDates = Array.isArray(dates) && dates.length > 0 ? dates : [eventDetails.date];
    const normalizedDates = eventDates.map((dateValue) => {
      const parsedDate = new Date(dateValue);
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid event date");
      }
      return parsedDate.toISOString();
    });

    // ── Optional: create event_series row first ─────────────────────
    // The series row owns the persistent ad URL (mama.is/events/<slug>).
    // We only create one when (a) the admin opted in, (b) there's a
    // slug, and (c) there are multiple dates — a single-date "series"
    // is just a normal event.
    let createdSeries = null;
    if (
      series &&
      typeof series.series_slug === "string" &&
      series.series_slug.trim().length > 0 &&
      normalizedDates.length > 1
    ) {
      const seriesSlugClean = slugify(series.series_slug);
      if (!seriesSlugClean) {
        return new Response(
          JSON.stringify({
            message:
              "Series URL slug is empty after normalisation. Pick a slug with at least one letter or number.",
          }),
          { status: 400 }
        );
      }

      // Collision check: the series slug shares the /events/<slug>
      // namespace with single-event slugs, so we must not let them
      // overlap. (Single-event slugs include a -MM-DD suffix so this
      // is rare in practice, but the check is cheap.)
      const { data: existingEventSlug } = await supabase
        .from("events")
        .select("id")
        .eq("slug", seriesSlugClean)
        .maybeSingle();
      if (existingEventSlug) {
        return new Response(
          JSON.stringify({
            message: `An event already uses the URL "${seriesSlugClean}". Choose a different series slug.`,
          }),
          { status: 409 }
        );
      }
      const { data: existingSeriesSlug } = await supabase
        .from("event_series")
        .select("id")
        .eq("slug", seriesSlugClean)
        .maybeSingle();
      if (existingSeriesSlug) {
        return new Response(
          JSON.stringify({
            message: `A series already uses the URL "${seriesSlugClean}". Pick a different slug or edit the existing series instead.`,
          }),
          { status: 409 }
        );
      }

      const seriesRow = {
        slug: seriesSlugClean,
        name: eventDetails.name,
        shortdescription: eventDetails.shortdescription || null,
        description: eventDetails.description || null,
        image: eventDetails.image || null,
        location: eventDetails.location || null,
        host: eventDetails.host || null,
        host_secondary: eventDetails.host_secondary || null,
        default_price: eventDetails.price || null,
        default_duration: eventDetails.duration || null,
        recurrence_label: series.recurrence_label || null,
        facebook_link: eventDetails.facebook_link || null,
        payment: eventDetails.payment || null,
        has_sliding_scale: eventDetails.has_sliding_scale || false,
        sliding_scale_min: eventDetails.sliding_scale_min || null,
        sliding_scale_max: eventDetails.sliding_scale_max || null,
        sliding_scale_suggested: eventDetails.sliding_scale_suggested || null,
        hosting_wl_policy_agreed: true,
        is_active: true,
        created_by: session.user?.email || null,
      };

      const { data: insertedSeries, error: seriesError } = await supabase
        .from("event_series")
        .insert(seriesRow)
        .select()
        .single();
      if (seriesError) throw seriesError;
      createdSeries = insertedSeries;
    }

    const usedSlugs = new Set();
    const eventsToCreate = [];
    for (const dateValue of normalizedDates) {
      const baseSlug = `${slugify(eventDetails.name)}-${formatDateKey(dateValue)}`;
      const slug = await getUniqueSlug(supabase, baseSlug, usedSlugs);
      eventsToCreate.push({
        ...eventDetails,
        date: dateValue,
        slug,
        // When a series row was just created, every instance points to it.
        // Series-less single events keep series_id NULL and behave exactly
        // as today.
        series_id: createdSeries ? createdSeries.id : null,
        created_at: new Date().toISOString(),
      });
    }

    const { data: createdEvents, error: eventsError } = await supabase
      .from("events")
      .insert(eventsToCreate)
      .select();
    if (eventsError) {
      // If event insert fails after the series row was created, roll
      // the series back so we don't leave an orphan parent.
      if (createdSeries) {
        await supabase.from("event_series").delete().eq("id", createdSeries.id);
      }
      throw eventsError;
    }

    if (!createdEvents || createdEvents.length === 0) {
      if (createdSeries) {
        await supabase.from("event_series").delete().eq("id", createdSeries.id);
      }
      throw new Error("No events were created");
    }

    // Create ticket variants for each created event
    if (ticket_variants && ticket_variants.length > 0) {
      const variantsToInsert = [];
      createdEvents.forEach((event) => {
        ticket_variants.forEach((variant) => {
          variantsToInsert.push({
            ...variant,
            event_id: event.id,
            created_at: new Date().toISOString(),
          });
        });
      });

      const { error: variantsError } = await supabase
        .from("ticket_variants")
        .insert(variantsToInsert);
      if (variantsError) throw variantsError;
    }

    // Send email to host(s). Multi-date support: if there are multiple
    // dates, we send one email noting all of them; the template's `eventDate`
    // is rendered as a single readable string for the first event.
    try {
      const managerEmails = [
        eventDetails.host,
        eventDetails.host_secondary,
      ]
        .map((e) => (typeof e === "string" ? e.trim() : ""))
        .filter(Boolean);
      const to = Array.from(new Set(managerEmails));

      if (to.length > 0) {
        const { html, text } = await renderEmail("event-created-host-notification", {
          eventName: createdEvents[0].name,
          eventDate: createdEvents[0].date,
          duration: createdEvents[0].duration,
          price: createdEvents[0].price,
          payment: createdEvents[0].payment,
          managerUrl: "https://mama.is/events/manager",
        });

        await resend.emails.send({
          from: "White Lotus <team@mama.is>",
          to,
          replyTo: "team@mama.is",
          subject:
            createdEvents.length > 1
              ? `Your events are live (${createdEvents.length} dates)`
              : "Your event is live",
          html,
          text,
        });
      }
    } catch (emailError) {
      console.error("Error sending event creation email to host:", emailError);
    }

    return new Response(
      JSON.stringify({
        event: createdEvents[0],
        events: createdEvents,
        count: createdEvents.length,
        // Surfacing the series slug so the form can land the admin
        // directly on /events/<slug> — that's the URL they're going
        // to paste into ads, so showing it works builds confidence.
        series: createdSeries || null,
        series_slug: createdSeries ? createdSeries.slug : null,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating event:", error);
    return new Response(
      JSON.stringify({ message: `Failed to create event: ${error.message}` }),
      { status: 500 }
    );
  }
}
