// A receipt from the till, sent to a guest who asked for it by email.
//
// The till lays the receipt out itself — the same lines it prints on paper,
// by the same code — and sends them here as plain text rows. This wraps them
// in a small email and hands it to Resend. Nothing is worked out here: what
// the guest reads is what the printer would have printed.
//
// Behind the same bearer token as bookings and saving. That token lives on a
// restaurant-owned tablet, so what it can send is kept narrow: one recipient,
// a bounded number of short text rows, always from Mama's own address under
// Mama's own heading. It is not a way to send arbitrary email.
import { NextResponse } from "next/server";
import { createResend } from "@/lib/resend";

export const dynamic = "force-dynamic";

const resend = createResend();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

const json = (body, init = {}) =>
  NextResponse.json(body, { ...init, headers: { ...CORS, ...(init.headers ?? {}) } });

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function authorised(request) {
  const key = process.env.POS_API_KEY;
  if (!key) return false;
  return (request.headers.get("authorization") ?? "") === `Bearer ${key}`;
}

const EMAIL = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/;
const MAX_ROWS = 250;
const MAX_ROW = 64;

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** POST /api/pos/receipt-email — { to, number, kind, paid, rows: [string] } */
export async function POST(request) {
  if (!authorised(request)) return json({ error: "Not authorised" }, { status: 401 });
  try {
    const body = await request.json();
    const to = typeof body.to === "string" ? body.to.trim() : "";
    const rows = Array.isArray(body.rows) ? body.rows : [];
    const number = typeof body.number === "string" ? body.number.replace(/[^\w-]/g, "").slice(0, 20) : "";

    if (!EMAIL.test(to) || to.length > 200) {
      return json({ error: "That email address does not look right" }, { status: 400 });
    }
    if (rows.length === 0 || rows.length > MAX_ROWS || rows.some((r) => typeof r !== "string" || r.length > MAX_ROW)) {
      return json({ error: "The receipt could not be read" }, { status: 400 });
    }

    // Paid in full is a receipt; anything else is a bill and says so. A
    // refund is its own paper: a credit note for money given back.
    const what =
      body.kind === "refund" ? "refund receipt" : body.paid === true ? "receipt" : "bill";
    const line =
      body.kind === "refund"
        ? "The amount below has been returned to you."
        : "Thank you for coming.";
    const text = rows.join("\n");
    const html = `<!doctype html>
<html><body style="margin:0;padding:24px 12px;background:#f4f1ec;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1c1c1c">
  <div style="max-width:420px;margin:0 auto">
    <p style="margin:0 0 4px;font-size:22px;font-weight:600;text-align:center">Mama Reykjavík</p>
    <p style="margin:0 0 18px;font-size:14px;color:#6b6b6b;text-align:center">Your ${what}${number ? ` #${number}` : ""}. ${line}</p>
    <div style="text-align:center">
      <div style="display:inline-block;background:#ffffff;border-radius:14px;padding:22px 24px;text-align:left">
        <pre style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;line-height:1.5;white-space:pre">${escape(text)}</pre>
      </div>
    </div>
    <p style="margin:18px 0 0;font-size:12px;color:#8a8a8a;text-align:center">Mama Reykjavík · Bankastræti 2 · team@mama.is</p>
  </div>
</body></html>`;

    const { error } = await resend.emails.send({
      from: "Mama Reykjavík <team@mama.is>",
      to: [to],
      replyTo: "team@mama.is",
      subject: `Your ${what} from Mama Reykjavík${number ? ` #${number}` : ""}`,
      html,
      text,
    });
    if (error) throw error;

    return json({ ok: true });
  } catch (err) {
    console.error("pos receipt email failed", err);
    return json({ error: "Could not send" }, { status: 500 });
  }
}
