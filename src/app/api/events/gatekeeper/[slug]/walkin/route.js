// POST /api/events/gatekeeper/[slug]/walkin
//
// Creates a real ticket row for a walk-in attendee, marked as already used
// (they're standing at the door). Mirrors the shape the kiosk UI collects:
//   {
//     buyer_name:   string (required),
//     buyer_email:  string | "" (optional — we never save placeholders),
//     payment:      "cash" | "transfer" | "pos" | "exchange" (required),
//     price:        number (the event price, or 0 for exchange/etc),
//     tip:          number | null,
//     exchange_note:string | null (required if payment = "exchange"),
//     receipt:      boolean (if true, requires buyer_email — we email a receipt),
//   }
//
// Status mapping:
//   cash     → status: "cash"
//   transfer → status: "transfer"
//   pos      → status: "card"       (POS is card hardware, stats already track "card")
//   exchange → status: "exchange"

import { Resend } from "resend";
import { resolveGatekeeperContext, jsonResponse } from "../../_lib";

const resend = new Resend(process.env.RESEND_API_KEY);

const PAYMENT_TO_STATUS = {
  cash: "cash",
  transfer: "transfer",
  pos: "card",
  exchange: "exchange",
};

function cleanEmail(v) {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return "";
  // Loose, forgiving pattern; the kiosk UI does the real validation.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : "";
}

export async function POST(req, { params }) {
  const { slug } = await params;
  const ctx = await resolveGatekeeperContext(slug);
  if (ctx.unauthenticated) return jsonResponse({ message: "Unauthorized" }, 401);
  if (ctx.notFound) return jsonResponse({ message: "Event not found" }, 404);
  if (!ctx.allowed) return jsonResponse({ message: "Forbidden" }, 403);
  if (!ctx.config?.activated_at) {
    return jsonResponse({ message: "Gatekeeper is not active." }, 400);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ message: "Invalid JSON" }, 400);
  }

  const name = String(body.buyer_name || "").trim().slice(0, 120);
  if (!name) return jsonResponse({ message: "Name is required" }, 400);

  const payment = String(body.payment || "").trim().toLowerCase();
  if (!PAYMENT_TO_STATUS[payment]) {
    return jsonResponse({ message: "Invalid payment method" }, 400);
  }

  // Only allow payment methods the host enabled.
  if (!ctx.config.enabled_methods.includes(payment)) {
    return jsonResponse({ message: "This payment method is not enabled" }, 400);
  }

  const receipt = !!body.receipt;
  const email = cleanEmail(body.buyer_email);
  if (receipt && !email) {
    return jsonResponse({ message: "An email is required for a receipt" }, 400);
  }

  const exchangeNote = String(body.exchange_note || "").trim().slice(0, 300);
  if (payment === "exchange" && !exchangeNote) {
    return jsonResponse({ message: "Exchange requires a short description" }, 400);
  }

  const basePrice = Number.isFinite(body.price) ? Number(body.price) : Number(ctx.event.price || 0);
  const tip = Number.isFinite(body.tip) && body.tip > 0 ? Math.round(body.tip) : 0;
  // For exchange the door "price" is typically 0 in revenue tracking.
  const priceForRow = payment === "exchange" ? 0 : basePrice;
  const total = priceForRow + tip;

  const now = new Date().toISOString();
  const ticketRow = {
    event_id: ctx.event.id,
    buyer_name: name,
    buyer_email: email || null,
    quantity: 1,
    status: PAYMENT_TO_STATUS[payment],
    used: true, // walk-ins are already through the door
    created_at: now,
    variant_name: payment === "exchange" ? "Door · Exchange" : "Door · Walk-in",
    price: priceForRow,
    total_price: total,
    gatekeeper: true,
    gatekeeper_tip: tip || null,
    gatekeeper_note: exchangeNote || null,
    gatekeeper_receipt_requested: receipt,
  };

  try {
    const { data: inserted, error } = await ctx.supabase
      .from("tickets")
      .insert(ticketRow)
      .select()
      .single();
    if (error) throw error;

    // Fire-and-forget receipt email — don't fail the check-in if email fails.
    if (receipt && email) {
      try {
        await sendReceiptEmail({ ticket: inserted, event: ctx.event, tip });
      } catch (emailErr) {
        console.error("Gatekeeper receipt email failed:", emailErr);
      }
    }

    return jsonResponse({ ticket: inserted });
  } catch (err) {
    return jsonResponse({ message: err.message }, 500);
  }
}

async function sendReceiptEmail({ ticket, event, tip }) {
  const eventDate = new Date(event.date);
  const methodLabel =
    ticket.status === "card"
      ? "Card (POS)"
      : ticket.status === "cash"
        ? "Cash"
        : ticket.status === "transfer"
          ? "Bank transfer"
          : "Exchange";

  await resend.emails.send({
    from: "Mama Reykjavik <team@mama.is>",
    to: [ticket.buyer_email],
    subject: `Your receipt — ${event.name}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; background:#fffaf4; border-radius: 18px;">
        <p style="font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#b8935a; margin:0 0 6px;">Mama Reykjavik · Receipt</p>
        <h1 style="font-family:Georgia, serif; font-weight:300; font-style:italic; color:#2b1f15; font-size:30px; margin:0 0 18px;">
          Thank you, ${ticket.buyer_name.split(" ")[0] || ticket.buyer_name}
        </h1>
        <p style="color:#4a3a2a; font-size:15px; line-height:1.6; margin:0 0 24px;">
          Here is your confirmation for <strong>${event.name}</strong> on
          ${eventDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.
        </p>
        <table style="width:100%; border-collapse:collapse; background:#fff; border-radius:12px; overflow:hidden; border:1px solid #f0e6d8;">
          <tbody>
            <tr><td style="padding:10px 16px; color:#9a7a62; font-size:13px;">Name</td><td style="padding:10px 16px; color:#2b1f15; font-size:14px;">${ticket.buyer_name}</td></tr>
            <tr><td style="padding:10px 16px; color:#9a7a62; font-size:13px;">Payment</td><td style="padding:10px 16px; color:#2b1f15; font-size:14px;">${methodLabel}</td></tr>
            <tr><td style="padding:10px 16px; color:#9a7a62; font-size:13px;">Ticket</td><td style="padding:10px 16px; color:#2b1f15; font-size:14px;">${Number(ticket.price || 0).toLocaleString()} ISK</td></tr>
            ${tip > 0 ? `<tr><td style="padding:10px 16px; color:#9a7a62; font-size:13px;">Tip</td><td style="padding:10px 16px; color:#2b1f15; font-size:14px;">${Number(tip).toLocaleString()} ISK</td></tr>` : ""}
            <tr style="background:#faf2e5;"><td style="padding:12px 16px; color:#7a5a3a; font-size:13px; font-weight:600;">Total</td><td style="padding:12px 16px; color:#2b1f15; font-size:15px; font-weight:600;">${Number(ticket.total_price || 0).toLocaleString()} ISK</td></tr>
          </tbody>
        </table>
        <p style="color:#7a5a3a; font-size:13px; line-height:1.7; margin:28px 0 0;">
          With warmth, the Mama team · Bankastræti 2, Reykjavík
        </p>
      </div>
    `,
  });
}
