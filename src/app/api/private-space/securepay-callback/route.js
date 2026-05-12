// Teya SecurePay server-to-server callback for The Private Space.
//
// Teya POSTs/REDIRECTs back to this URL with form-encoded fields after a
// successful payment. We verify the OrderHash, mark the booking paid, and
// (for recurring bookings) capture the saved virtualcardnumber for future
// MIT charges.
//
// IMPORTANT: We store `refundid` (10-digit gateway id), NOT `authorizationcode`
// — RPG refund rejects the auth code. See memory: mama_teya_callback_field.

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServerSupabase } from "@/util/supabase/server";
import { verifyOrderHash, TEYA_SECUREPAY } from "@/lib/membershipTeya";
import { renderEmail } from "@/emails/render.server";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = "Mama Reykjavik <team@mama.is>";

async function readBody(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    return Object.fromEntries(new URLSearchParams(text));
  }
  if (contentType.includes("application/json")) {
    return await request.json();
  }
  // GET-style query string fallback
  const url = new URL(request.url);
  return Object.fromEntries(url.searchParams);
}

async function handle(request) {
  try {
    const params = await readBody(request);
    const orderid = params.orderid || params.orderId;
    const amount = params.amount;
    const currency = params.currency || "ISK";
    const orderhash = params.orderhash || params.orderHash;
    const refundid = params.refundid || params.refundId; // 10-digit gateway id
    const virtualcardnumber = params.virtualcardnumber || params.virtualCardNumber;

    if (!orderid || !amount || !orderhash) {
      console.error("[ps-callback] missing fields", { orderid: !!orderid, amount: !!amount, orderhash: !!orderhash });
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const valid = verifyOrderHash({
      orderid,
      amount,
      currency,
      providedHash: orderhash,
      secretKey: TEYA_SECUREPAY.secretKey(),
    });

    if (!valid) {
      console.error("[ps-callback] invalid orderhash for orderid", orderid);
      return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data: row, error: fetchErr } = await supabase
      .from("private_space_bookings")
      .select("*")
      .eq("securepay_orderid", orderid)
      .single();

    if (fetchErr || !row) {
      console.error("[ps-callback] booking not found for orderid", orderid);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Idempotent: if already paid, just return ok
    if (row.status === "paid" || row.status === "confirmed") {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    const updates = {
      status: "confirmed",
      paid_at: new Date().toISOString(),
      securepay_refundid: refundid || null,
    };

    // Recurring: stash the VCN in metadata for the renewal cron to convert → MultiToken
    if (row.booking_type === "recurring_weekly" && virtualcardnumber) {
      updates.metadata = { ...(row.metadata || {}), virtualcardnumber };
    }

    await supabase.from("private_space_bookings").update(updates).eq("id", row.id);

    // If recurring + we have a VCN, also create a subscription row
    if (row.booking_type === "recurring_weekly" && virtualcardnumber) {
      await supabase.from("private_space_subscriptions").insert({
        booking_id: row.id,
        contact_name: row.contact_name,
        contact_email: row.contact_email,
        contact_phone: row.contact_phone,
        weekday: row.recurrence_weekday,
        start_time: row.recurrence_start_time,
        duration_minutes: row.recurrence_duration_minutes,
        monthly_amount_isk: row.total_amount_isk,
        rpg_multitoken: virtualcardnumber, // converted to real MultiToken on first cron renewal
        next_charge_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
        language: row.language,
      });
    }

    sendPaidConfirmationEmail(row).catch((e) => console.error("[ps-callback] email", e));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[ps-callback] fatal", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export { handle as GET, handle as POST };

async function sendPaidConfirmationEmail(row) {
  if (!resend) return;
  const { html, text, subject } = await renderEmail("private-space-paid", {
    contactName: row.contact_name,
    referenceId: row.reference_id,
    startAt: row.start_at,
    endAt: row.end_at,
  });
  await resend.emails.send({
    from: FROM,
    to: row.contact_email,
    subject: subject || `Booking confirmed · ${row.reference_id}`,
    html,
    text,
  });
}
