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

  const firstName =
    (ticket.buyer_name || "").split(" ")[0] || ticket.buyer_name || "friend";
  const dateLine = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const isk = (n) => `${Number(n || 0).toLocaleString()} ISK`;

  const row = (label, value, emphasis = false) => `
    <tr>
      <td style="padding:14px 18px;border-top:1px solid #eadfd2;color:#9a7a62;font-size:12px;text-transform:uppercase;letter-spacing:1.6px;">${label}</td>
      <td style="padding:14px 18px;border-top:1px solid #eadfd2;color:#1a1410;font-size:${emphasis ? "16px" : "14px"};font-weight:${emphasis ? "700" : "500"};text-align:right;">${value}</td>
    </tr>
  `;

  await resend.emails.send({
    from: "Mama Reykjavik <team@mama.is>",
    to: [ticket.buyer_email],
    subject: `Receipt · ${event.name}`,
    html: `
      <div style="background:#f9f4ec;padding:28px 16px;font-family:'Helvetica Neue',Arial,sans-serif;">
        <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;border-collapse:separate;border-spacing:0;">
          <tr>
            <td style="background:#1a1410;border-radius:24px 24px 0 0;padding:32px 28px 28px;text-align:center;">
              <p style="margin:0 0 6px;color:#ff914d;font-size:10px;text-transform:uppercase;letter-spacing:4px;">Mama Reykjavík · Receipt</p>
              <h1 style="margin:8px 0 0;color:#f0ebe3;font-family:Georgia,serif;font-style:italic;font-weight:300;font-size:34px;line-height:1.05;">
                Thank you, ${firstName}.
              </h1>
              <p style="margin:14px 0 0;color:#c4b8aa;font-size:14px;line-height:1.55;">
                You're checked in for <strong style="color:#f0ebe3;font-weight:600;">${event.name}</strong>.
              </p>
              <p style="margin:6px 0 0;color:#9a8772;font-size:12px;">${dateLine}</p>
            </td>
          </tr>
          <tr>
            <td style="background:#fffaf5;padding:24px 22px 28px;border-radius:0 0 24px 24px;border:1px solid #eadfd2;border-top:none;">
              <table role="presentation" width="100%" style="border-collapse:separate;border-spacing:0;background:#ffffff;border:1px solid #eadfd2;border-radius:18px;overflow:hidden;">
                <tr>
                  <td colspan="2" style="padding:14px 18px;background:#fff4e8;color:#9a7a62;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">
                    Order summary
                  </td>
                </tr>
                ${row("Name", ticket.buyer_name)}
                ${row("Payment", methodLabel)}
                ${row("Ticket", isk(ticket.price))}
                ${tip > 0 ? row("Tip", isk(tip)) : ""}
                ${row("Total", isk(ticket.total_price), true)}
              </table>

              <p style="margin:24px 0 0;color:#6f5a49;font-size:13px;line-height:1.7;">
                Keep this email as your proof of payment. We'll see you at the door.
              </p>

              <table role="presentation" width="100%" style="margin-top:20px;border-collapse:separate;border-spacing:0;">
                <tr>
                  <td style="padding:16px 0 0;border-top:1px solid #eadfd2;color:#9a7a62;font-size:12px;line-height:1.6;text-align:center;">
                    Mama Reykjavík · Bankastræti 2 · Reykjavík<br/>
                    <a href="https://mama.is" style="color:#ff914d;text-decoration:none;font-weight:600;">mama.is</a>
                    &nbsp;·&nbsp;
                    <a href="mailto:team@mama.is" style="color:#ff914d;text-decoration:none;font-weight:600;">team@mama.is</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
  });
}
