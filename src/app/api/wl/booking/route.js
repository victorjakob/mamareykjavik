// POST /api/wl/booking — store WL booking + send team + customer emails.
//
// Cleanup note: previously this file built two ~700-line HTML strings inline
// for the team and customer emails (in two languages). Both are now React
// Email templates rendered via renderEmail():
//   - team    → "wl-booking-admin-notification"
//   - customer → "wl-booking-customer-confirmation" (bilingual is/en stacked)

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { validateBookingData } from "../../../whitelotus/booking/utils/validation";
import { createServerSupabase } from "@/util/supabase/server";
import { renderEmail } from "@/emails/render.server";

const resend = new Resend(process.env.RESEND_API_KEY);

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  return "http://localhost:3000";
};

export async function POST(request) {
  try {
    const body = await request.json();

    const validation = validateBookingData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Reference ID = email-username + DD-MM, with random suffix on collision
    const generateReferenceId = async (email, date, supabase) => {
      const username = email.split("@")[0].toLowerCase();
      const dateObj = new Date(date);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const baseId = `${username}-${day}-${month}`;
      const { data: existing } = await supabase
        .from("whitelotus_bookings")
        .select("reference_id")
        .eq("reference_id", baseId)
        .single();
      if (existing) {
        const randomSuffix = Math.random()
          .toString(36)
          .substring(2, 6)
          .toLowerCase();
        return `${baseId}-${randomSuffix}`;
      }
      return baseId;
    };

    const initialReferenceId = await generateReferenceId(
      body.contact?.email || "guest@email.com",
      body.dateTime?.preferred || new Date(),
      createServerSupabase()
    );

    const baseUrl = getBaseUrl();
    let bookingUrl = `${baseUrl}/whitelotus/booking/${initialReferenceId}`;

    const supabase = createServerSupabase();

    // Insert with retry on duplicate-key collision
    let finalReferenceId = initialReferenceId;
    let insertedBooking = null;
    let dbError = null;
    let retries = 0;
    const maxRetries = 3;

    while (retries <= maxRetries) {
      const { data, error } = await supabase
        .from("whitelotus_bookings")
        .insert({
          reference_id: finalReferenceId,
          contact_name: body.contact?.name || "",
          contact_email: body.contact?.email || "",
          contact_phone: body.contact?.phone || "",
          contact_company: body.contact?.company || null,
          contact_kennitala: body.contact?.kennitala || null,
          event_type: body.eventType || null,
          preferred_datetime: body.dateTime?.preferred || null,
          start_time: body.dateTime?.startTime || null,
          end_time: body.dateTime?.endTime || null,
          datetime_comment: body.dateTimeComment || null,
          needs_early_access:
            body.needsEarlyAccess !== undefined ? body.needsEarlyAccess : null,
          setup_time: body.setupTime || null,
          services: body.services || [],
          services_comment: body.servicesComment || null,
          staff_cost_acknowledged: body.staffCostAcknowledged || false,
          no_own_alcohol_confirmed: body.noOwnAlcoholConfirmed || false,
          food: body.food || null,
          food_details: body.foodDetail || null,
          food_comment: body.foodComment || null,
          drinks: body.drinks || null,
          drinks_comment: body.drinks?.comment || null,
          guest_count: body.guestCount || null,
          guest_count_comment: body.guestCountComment || null,
          room_setup: body.roomSetup || null,
          room_setup_comment: body.roomSetupComment || null,
          tech_and_music: body.techAndMusic || null,
          tablecloth_data: body.tableclothData || null,
          notes: body.notes || null,
          language: body.language || "is",
          status: "pending",
          booking_data: body,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505" && retries < maxRetries) {
          const randomSuffix = Math.random()
            .toString(36)
            .substring(2, 6)
            .toLowerCase();
          const parts = initialReferenceId.split("-");
          const baseId =
            parts.length > 3
              ? parts.slice(0, -1).join("-")
              : initialReferenceId;
          finalReferenceId = `${baseId}-${randomSuffix}`;
          retries++;
          continue;
        }

        dbError = error;
        break;
      }

      insertedBooking = data;
      break;
    }

    if (dbError) {
      console.error("Database storage error:", dbError);
      console.error("Reference ID:", finalReferenceId);
      console.error("Error details:", JSON.stringify(dbError, null, 2));
      return NextResponse.json({
        success: true,
        id: finalReferenceId,
        message: "Bókun staðfest (villa við gagnagrunn)",
        warning:
          "Bókun var ekki vistað í gagnagrunn. Vinsamlegast hafðu samband við okkur.",
      });
    }

    console.log("Booking stored successfully:", insertedBooking?.reference_id);
    bookingUrl = `${baseUrl}/whitelotus/booking/${finalReferenceId}`;

    // ── Team email (admin notification) ──────────────────────────
    const team = await renderEmail("wl-booking-admin-notification", {
      referenceId: finalReferenceId,
      bookingUrl,
      contactName: body.contact?.name || "—",
      contactEmail: body.contact?.email || "—",
      contactCompany: body.contact?.company || null,
      preferredDate: body.dateTime?.preferred || null,
      startTime: body.dateTime?.startTime || null,
      endTime: body.dateTime?.endTime || null,
      needsEarlyAccess: body.needsEarlyAccess ?? null,
      setupTime: body.setupTime || null,
    });

    await resend.emails.send({
      from: "White Lotus Booking <team@mama.is>",
      to: "team@whitelotus.is",
      replyTo: body.contact.email,
      subject: `Booking confirmed - ${finalReferenceId}`,
      html: team.html,
      text: team.text,
    });

    // ── Customer confirmation (bilingual is/en stacked) ──────────
    const customer = await renderEmail("wl-booking-customer-confirmation", {
      contactName: body.contact?.name || "",
      referenceId: finalReferenceId,
      bookingUrl,
      dateTime: body.dateTime || {},
      guestCount: body.guestCount || "",
      dateTimeComment: body.dateTimeComment || null,
      staffCostAcknowledged: !!body.staffCostAcknowledged,
      noOwnAlcoholConfirmed: !!body.noOwnAlcoholConfirmed,
      notes: body.notes || null,
    });

    await resend.emails.send({
      from: "White Lotus <team@mama.is>",
      to: [body.contact.email],
      replyTo: "team@thewhitelotus.is",
      subject: `Booking confirmed — ${finalReferenceId}`,
      html: customer.html,
      text: customer.text,
    });

    return NextResponse.json({
      success: true,
      id: finalReferenceId,
      message: "Bókun staðfest",
    });
  } catch (error) {
    console.error("Booking submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit booking request" },
      { status: 500 }
    );
  }
}
