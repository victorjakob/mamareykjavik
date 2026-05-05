import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/util/supabase/client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

const getUniqueSlug = async (baseSlug, usedSlugs = new Set()) => {
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
      const slug = await getUniqueSlug(baseSlug, usedSlugs);
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

    // Send email to host
    try {
      const eventDateTimes = createdEvents.map((event) =>
        new Date(event.date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      const managerEmails = [
        eventDetails.host,
        eventDetails.host_secondary,
      ]
        .map((e) => (typeof e === "string" ? e.trim() : ""))
        .filter(Boolean);
      const to = Array.from(new Set(managerEmails));

      await resend.emails.send({
        from: "White Lotus <team@mama.is>",
        to,
        replyTo: "team@mama.is",
        subject: "Your Event Has Been Created!",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
            <h1 style="color: #4caf50;">Event Created Successfully!</h1>
            <h2>Event Details:</h2>
            <ul style="list-style: none; padding-left: 0;">
              <li><strong>Event Name:</strong> ${createdEvents[0].name}</li>
              <li><strong>Date${
                createdEvents.length > 1 ? "s" : ""
              }:</strong> ${eventDateTimes.join(", ")}</li>
              <li><strong>Duration:</strong> ${createdEvents[0].duration} hour(s)</li>
              <li><strong>Price:</strong> ${createdEvents[0].price} ISK</li>
              <li><strong>Payment Type:</strong> ${createdEvents[0].payment}</li>
            </ul>
            <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
              <h3>Effortlessly Manage Your Event</h3>
              <p>Your event has been created. If you don't have an account, please <a href="https://www.mama.is/auth" style="color: #4F46E5; font-weight: bold;">create one here</a> and let us know once you have so we can open your management dashboard.</p>
              <p>Visit your event management dashboard to create, edit, and manage your events:</p>
              <p>
                <a href="https://mama.is/events/manager" style="color: #4F46E5; font-weight: bold;">
                  Event Manager Portal
                </a>
              </p>
            </div>
            <div style="margin-top: 30px;">
              <h3>Need Help?</h3>
              <p>If you need any assistance or have questions about your event, please don't hesitate to contact us at team@whitelotus.is</p>
            </div>
            <div style="margin-top: 30px; padding-top: 18px; border-top: 1px solid #e5e7eb;">
              <h3>Terms &amp; Agreements</h3>
              <p style="margin: 0 0 10px 0;">
                By hosting this event, you confirmed you agree to the White Lotus Event Host Policy.
              </p>
              <p style="margin: 0;">
                <a href="https://mama.is/policies/hosting-wl" style="color: #4F46E5; font-weight: bold;">
                  Read the Event Host Policy
                </a>
              </p>
            </div>
            <p style="margin-top: 30px; font-style: italic;">We look forward to hosting your event at Mama!</p>
          </div>
        `,
      });
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
