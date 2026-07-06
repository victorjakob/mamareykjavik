// Host report — shared builder + sender.
//
// Scope: ONLINE tickets only (status "paid" — bought through mama.is).
// Cash, card-reader, transfer and door/kiosk sales are deliberately
// excluded: this report accounts for the money that came in through the
// website, and the email says so explicitly.
//
// Used by:
//   • /events/[slug]/manage/report      — manual send from the hub modal
//   • /api/cron/host-reports            — auto-send once the event ends

import "server-only";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

// Only tickets sold online through mama.is.
const ONLINE_STATUSES = ["paid"];

// Service fee we take on online card payments — matches FEE_RATE.paid in
// the manage hub's SalesPanel. Only applied when the event's
// fee_online_enabled flag is on (same toggle the sales tab persists).
const ONLINE_FEE_RATE = 0.05;

export async function buildHostReport(supabase, eventId) {
  const { data: eventRow } = await supabase
    .from("events")
    .select("fee_online_enabled")
    .eq("id", eventId)
    .maybeSingle();
  const feeEnabled = eventRow?.fee_online_enabled ?? true;

  const { data, error } = await supabase
    .from("tickets")
    .select("buyer_name, buyer_email, quantity, total_price, variant_name, created_at")
    .eq("event_id", eventId)
    .in("status", ONLINE_STATUSES)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  const rows = data || [];
  let guestsCount = 0;
  let revenue = 0;
  const variantAcc = new Map();
  let hasVariants = false;

  const guests = rows.map((t) => {
    const q = t.quantity || 0;
    const total = Number(t.total_price || 0);
    guestsCount += q;
    revenue += total;

    if (t.variant_name) hasVariants = true;
    const key = t.variant_name || "Standard";
    const v = variantAcc.get(key) || { name: key, tickets: 0, revenue: 0 };
    v.tickets += q;
    v.revenue += total;
    variantAcc.set(key, v);

    return {
      name: t.buyer_name || "Guest",
      email: t.buyer_email || "",
      quantity: q,
      variantName: t.variant_name || null,
      total,
    };
  });

  const fee = feeEnabled ? Math.round(revenue * ONLINE_FEE_RATE) : 0;
  return {
    totals: {
      guests: guestsCount,
      orders: rows.length,
      revenue,
      feeRate: feeEnabled ? ONLINE_FEE_RATE : 0,
      fee,
      net: revenue - fee,
    },
    guests,
    hasVariants,
    variants: hasVariants ? Array.from(variantAcc.values()) : [],
  };
}

export function hostRecipients(event) {
  return Array.from(
    new Set(
      [event.host, event.host_secondary]
        .map((e) => (typeof e === "string" ? e.trim() : ""))
        .filter(Boolean)
    )
  );
}

// Renders and sends the report, then stamps events.host_report_sent_at so
// the cron never double-sends. `to` is an array of recipient emails.
export async function sendHostReport(supabase, event, to, report = null) {
  const built = report || (await buildHostReport(supabase, event.id));

  const { html, text } = await renderEmail("event-host-report", {
    eventName: event.name,
    eventDate: event.date,
    totals: built.totals,
    guests: built.guests,
    variants: built.variants,
    hasVariants: built.hasVariants,
  });

  const resend = createResend();
  await resend.emails.send({
    from: "Mama Reykjavik <team@mama.is>",
    to,
    subject: `${event.name} — online sales report`,
    html,
    text,
  });

  await supabase
    .from("events")
    .update({ host_report_sent_at: new Date().toISOString() })
    .eq("id", event.id);

  return built;
}
