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

    const usedSlugs = new Set();
    const eventsToCreate = [];
    for (const dateValue of normalizedDates) {
      const baseSlug = `${slugify(eventDetails.name)}-${formatDateKey(dateValue)}`;
      const slug = await getUniqueSlug(baseSlug, usedSlugs);
      eventsToCreate.push({
        ...eventDetails,
        date: dateValue,
        slug,
        created_at: new Date().toISOString(),
      });
    }

    const { data: createdEvents, error: eventsError } = await supabase
      .from("events")
      .insert(eventsToCreate)
      .select();
    if (eventsError) throw eventsError;

    if (!createdEvents || createdEvents.length === 0) {
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
