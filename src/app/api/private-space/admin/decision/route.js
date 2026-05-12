// POST /api/private-space/admin/decision
// Admin-only endpoint to approve or decline a booking request.
//
// Body:
//   { reference_id: "PS-...", action: "approve" | "decline", reason?: string }
//
// On approve:
//   - Sets status='approved'
//   - Generates SecurePay payment URL, stores orderid
//   - Emails the customer the payment link
//
// On decline:
//   - Sets status='declined' with decline_reason
//   - Emails the customer with the (optional) reason

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { isAdmin } from "@/util/getRole";
import { createServerSupabase } from "@/util/supabase/server";
import { buildPrivateSpaceCheckoutUrl } from "@/lib/private-space/teya";
import { renderEmail } from "@/emails/render.server";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const Schema = z.object({
  reference_id: z.string().min(1),
  action: z.enum(["approve", "decline"]),
  reason: z.string().max(2000).optional().nullable(),
});

export async function POST(request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const json = await request.json();
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }
    const { reference_id, action, reason } = parsed.data;

    const supabase = createServerSupabase();
    const { data: row, error: fetchErr } = await supabase
      .from("private_space_bookings")
      .select("*")
      .eq("reference_id", reference_id)
      .single();

    if (fetchErr || !row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (row.status !== "pending") {
      return NextResponse.json({ error: `Already ${row.status}` }, { status: 400 });
    }

    if (action === "decline") {
      await supabase
        .from("private_space_bookings")
        .update({ status: "declined", decline_reason: reason || null })
        .eq("id", row.id);

      sendDeclineEmail(row, reason).catch((e) => console.error("[decline-email]", e));
      return NextResponse.json({ ok: true });
    }

    // action === "approve"
    const isRecurring = row.booking_type === "recurring_weekly";

    let payment;
    try {
      payment = buildPrivateSpaceCheckoutUrl({
        amount: row.total_amount_isk,
        buyerName: row.contact_name,
        buyerEmail: row.contact_email,
        language: row.language === "is" ? "IS" : "EN",
        referenceId: row.reference_id,
        savecard: isRecurring, // recurring needs the VCN for future MIT charges
      });
    } catch (e) {
      console.error("[approve] failed to build checkout URL", e);
      return NextResponse.json({ error: "Could not generate payment link", details: e.message }, { status: 500 });
    }

    await supabase
      .from("private_space_bookings")
      .update({
        status: "approved",
        securepay_orderid: payment.orderId,
        payment_method: "securepay",
      })
      .eq("id", row.id);

    sendApprovalEmail(row, payment.redirectUrl).catch((e) => console.error("[approve-email]", e));
    return NextResponse.json({ ok: true, payment_url: payment.redirectUrl });
  } catch (err) {
    console.error("[private-space/admin/decision] fatal", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const FROM = "Mama Reykjavik <team@mama.is>";

async function sendApprovalEmail(row, paymentUrl) {
  if (!resend) return;
  const { html, text, subject } = await renderEmail("private-space-approved", {
    contactName: row.contact_name,
    referenceId: row.reference_id,
    startAt: row.start_at,
    endAt: row.end_at,
    totalIsk: row.total_amount_isk,
    paymentUrl,
  });
  await resend.emails.send({
    from: FROM,
    to: row.contact_email,
    subject: subject || `Booking approved · payment link · ${row.reference_id}`,
    html,
    text,
  });
}

async function sendDeclineEmail(row, reason) {
  if (!resend) return;
  const privateSpaceUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is"}/private-space`;
  const { html, text, subject } = await renderEmail("private-space-declined", {
    contactName: row.contact_name,
    reason: reason || null,
    privateSpaceUrl,
  });
  await resend.emails.send({
    from: FROM,
    to: row.contact_email,
    subject: subject || `About your request · ${row.reference_id}`,
    html,
    text,
  });
}
