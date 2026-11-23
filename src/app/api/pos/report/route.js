// A health report from the till, emailed to the restaurant's own address.
//
// For when something is wrong and Victor is not there: whoever is at the
// tablet presses one button in Settings, and what the till can see of itself
// — network, mama.is, each printer, what is unsaved — arrives as an email,
// instead of being described over the telephone.
//
// Behind the till's bearer token. It can only ever write to one fixed
// address, with a bounded amount of plain text.
import { NextResponse } from "next/server";
import { createResend } from "@/lib/resend";

export const dynamic = "force-dynamic";

const resend = createResend();
const TO = "team@mama.is";

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

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** POST /api/pos/report — { summary, rows: [string] } */
export async function POST(request) {
  if (!authorised(request)) return json({ error: "Not authorised" }, { status: 401 });
  try {
    const body = await request.json();
    const rows = Array.isArray(body.rows) ? body.rows : [];
    if (rows.length === 0 || rows.length > 120 || rows.some((r) => typeof r !== "string" || r.length > 240)) {
      return json({ error: "The report could not be read" }, { status: 400 });
    }
    const summary = typeof body.summary === "string" ? body.summary.slice(0, 80) : "Report";
    const text = rows.join("\n");
    const { error } = await resend.emails.send({
      from: "Mama Till <team@mama.is>",
      to: [TO],
      subject: `Mama Till: ${summary}`,
      text,
      html: `<pre style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;line-height:1.5;white-space:pre-wrap">${escape(text)}</pre>`,
    });
    if (error) throw error;
    return json({ ok: true, to: TO });
  } catch (err) {
    console.error("pos report failed", err);
    return json({ error: "Could not send" }, { status: 500 });
  }
}
