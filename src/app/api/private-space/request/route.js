// POST /api/private-space/request
// Create a Private Space booking request.
// Status starts as "pending". Admin reviews via /private-space/admin and approves
// (which generates a payment link) or declines.

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { createServerSupabase } from "@/util/supabase/server";
import {
  applyPromo,
  calculateSubtotal,
  generateReferenceId,
} from "@/lib/private-space/pricing";
import { renderEmail } from "@/emails/render.server";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const PracticeTypes = ["therapy", "coaching", "bodywork", "energy", "circle", "lesson", "shoot", "other"];
const BookingTypes = ["hourly", "half_day", "full_day", "recurring_weekly"];

const Schema = z.object({
  booking_type: z.enum(BookingTypes),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  practice_type: z.enum(PracticeTypes).default("other"),
  practice_description: z.string().max(2000).optional().nullable(),
  group_size: z.number().int().min(1).max(10).default(1),
  contact_name: z.string().min(1).max(120),
  contact_email: z.string().email().max(160),
  contact_phone: z.string().max(40).optional().nullable(),
  promo_code: z.string().max(40).optional().nullable(),
  language: z.enum(["en", "is"]).default("is"),
  recurrence_weekday: z.number().int().min(0).max(6).optional().nullable(),
  recurrence_start_time: z.string().optional().nullable(),
  recurrence_duration_minutes: z.number().int().optional().nullable(),
  duration_hours: z.number().int().optional().nullable(),
});

function durationHoursFor(body) {
  if (body.booking_type === "hourly" && body.duration_hours) return body.duration_hours;
  return Math.round((new Date(body.end_at) - new Date(body.start_at)) / (1000 * 60 * 60));
}

export async function POST(request) {
  try {
    const json = await request.json();
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // Authoritative price (do not trust client total)
    const recurringHrs = body.recurrence_duration_minutes ? body.recurrence_duration_minutes / 60 : 0;
    const { subtotalIsk } = calculateSubtotal({
      bookingType: body.booking_type,
      durationHours: durationHoursFor(body),
      recurringHoursPerWeek: recurringHrs,
    });
    const { discountIsk, totalIsk, applied } = applyPromo(subtotalIsk, body.promo_code);

    if (totalIsk <= 0) {
      return NextResponse.json({ error: "Booking total must be > 0" }, { status: 400 });
    }

    const reference_id = generateReferenceId(body.contact_email, body.start_at);
    const supabase = createServerSupabase();

    const insertRow = {
      reference_id,
      contact_name: body.contact_name.trim(),
      contact_email: body.contact_email.trim().toLowerCase(),
      contact_phone: body.contact_phone || null,
      practice_type: body.practice_type,
      practice_description: body.practice_description || null,
      group_size: body.group_size,
      booking_type: body.booking_type,
      start_at: body.start_at,
      end_at: body.end_at,
      recurrence_weekday: body.recurrence_weekday ?? null,
      recurrence_start_time: body.recurrence_start_time ?? null,
      recurrence_duration_minutes: body.recurrence_duration_minutes ?? null,
      total_amount_isk: totalIsk,
      promo_code: applied ? body.promo_code : null,
      discount_amount_isk: discountIsk,
      status: "pending",
      language: body.language,
      booking_data: body,
    };

    const { data: row, error } = await supabase
      .from("private_space_bookings")
      .insert(insertRow)
      .select("id, reference_id")
      .single();

    if (error) {
      console.error("[private-space/request] insert error", error);
      return NextResponse.json({ error: "Could not save request" }, { status: 500 });
    }

    // Fire-and-forget emails (don't block submission on send failure)
    sendEmails(insertRow).catch((e) => console.error("[private-space/request] email error", e));

    return NextResponse.json({ ok: true, reference_id: row.reference_id });
  } catch (err) {
    console.error("[private-space/request] fatal", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function sendEmails(row) {
  if (!resend) return;

  const FROM = "Mama Reykjavik <team@mama.is>";
  const ADMIN_TO = process.env.PRIVATE_SPACE_ADMIN_EMAIL || "mama.reykjavik@gmail.com";
  // /private-space/admin/[ref] doesn't exist yet — point at the index and
  // pass the ref as a query param so the admin can find the row, and so
  // a future per-ref page can pick it up without changing this URL.
  const reviewUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is"}/private-space/admin?ref=${encodeURIComponent(row.reference_id)}`;

  // English-only — the language column on the row is ignored for emails.
  const customerSubject = `Request received · The Private Space · ${row.reference_id}`;

  const fmtIsk = (n) => `${(Number(n) || 0).toLocaleString("is-IS")} ISK`;
  const adminSubject = `[Private Space] New ${row.booking_type} request · ${fmtIsk(row.total_amount_isk)} · ${row.reference_id}`;

  const [customer, admin] = await Promise.all([
    renderEmail("private-space-request-customer", {
      contactName: row.contact_name,
      referenceId: row.reference_id,
      bookingType: row.booking_type,
      startAt: row.start_at,
      endAt: row.end_at,
      totalIsk: row.total_amount_isk,
      language: row.language,
    }),
    renderEmail("private-space-request-admin", {
      contactName: row.contact_name,
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      referenceId: row.reference_id,
      bookingType: row.booking_type,
      practiceType: row.practice_type,
      groupSize: row.group_size,
      startAt: row.start_at,
      endAt: row.end_at,
      totalIsk: row.total_amount_isk,
      discountIsk: row.discount_amount_isk,
      practiceDescription: row.practice_description,
      reviewUrl,
    }),
  ]);

  await Promise.all([
    resend.emails.send({
      from: FROM,
      to: row.contact_email,
      subject: customerSubject,
      html: customer.html,
      text: customer.text,
    }),
    resend.emails.send({
      from: FROM,
      to: ADMIN_TO,
      subject: adminSubject,
      html: admin.html,
      text: admin.text,
    }),
  ]);
}
