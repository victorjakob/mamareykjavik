// The shift report, filled in on the till at the end of a shift.
//
// Until now staff closed the till and then opened Mama Manager on another
// device to write the same evening down again. This takes the report from
// the till and puts it where Mama Manager's own form puts it —
// `manage_shift_logs`, and `manage_needs_fixing` for anything broken — and
// emails it to the team the same way. So Mama Manager's lists, dashboards and
// "needs fixing" all show it with nothing changed on their side, and the two
// forms can run side by side until the till's is the only one used.
//
// The shape of a row follows mama-manager's `src/app/api/shift-report/route.js`
// exactly. If that one changes, this one has to.
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { createResend } from "@/lib/resend";

export const dynamic = "force-dynamic";

const resend = createResend();
const TO = "team@mama.is";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

const text = (v, max) => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
};
const escape = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * GET /api/pos/shift-report — the notes the last few shifts left for the next.
 *
 * For the till's notice board: what yesterday's shift wanted today's to know.
 * Only reports that have such a note, newest first, and only the fields the
 * board shows.
 */
export async function GET(request) {
  if (!authorised(request)) return json({ error: "Not authorised" }, { status: 401 });
  try {
    const since = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("manage_shift_logs")
      .select("shift_date, shift, shift_leader_name, notes_for_next_shift, unavailable_items, created_at")
      .gte("shift_date", since)
      .order("created_at", { ascending: false })
      .limit(12);
    if (error) throw error;
    return json({
      ok: true,
      notes: data
        .filter((r) => r.notes_for_next_shift || r.unavailable_items)
        .map((r) => ({
          date: r.shift_date,
          shift: r.shift,
          from: r.shift_leader_name,
          note: r.notes_for_next_shift,
          missing: r.unavailable_items,
          at: r.created_at,
        })),
    });
  } catch (err) {
    console.error("pos shift notes failed", err);
    return json({ error: "Could not read" }, { status: 500 });
  }
}

/** POST /api/pos/shift-report */
export async function POST(request) {
  if (!authorised(request)) return json({ error: "Not authorised" }, { status: 401 });
  try {
    const body = await request.json();
    const leader = text(body.shift_leader_name, 200);
    if (!leader) return json({ error: "The shift leader's name is needed" }, { status: 400 });

    const busy = Math.min(10, Math.max(1, Math.round(Number(body.busy_level) || 5)));
    const sales = Number.isFinite(Number(body.total_sales)) ? Math.max(0, Math.round(Number(body.total_sales))) : null;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(body.shift_date ?? "") ? body.shift_date : new Date().toISOString().slice(0, 10);

    const row = {
      shift_date: date,
      shift: text(body.shift, 40) ?? "Other",
      shift_leader_name: leader,
      total_sales: sales,
      staff_on_shift: null,
      busy_level: String(busy),
      shift_feel: text(body.shift_feel, 1000),
      share_with_us: text(body.share_with_us, 1000),
      unavailable_items: text(body.unavailable_items, 500),
      complaints_guest_issues: text(body.complaints_guest_issues, 500),
      make_it_right_offers: null,
      stock_running_low_missing: null,
      equipment_needs_fixing: text(body.equipment_needs_fixing, 500),
      what_went_well: text(body.what_went_well, 500),
      notes_for_next_shift: text(body.notes_for_next_shift, 1000),
    };

    const supabase = createServerSupabase();
    const { error } = await supabase.from("manage_shift_logs").insert(row);
    if (error) throw error;

    // Anything broken also goes on Mama Manager's "Needs fixing" list.
    if (row.equipment_needs_fixing) {
      await supabase.from("manage_needs_fixing").insert({ person_name: leader, message: row.equipment_needs_fixing });
    }

    // Saved is what matters; the email is a courtesy and may fail quietly.
    let emailSent = true;
    try {
      const lines = [
        ["Total sales", sales != null ? `${sales.toLocaleString("en-US")} kr` : ""],
        ["How busy", `${busy} / 10`],
        ["How it felt", row.shift_feel],
        ["Share with us", row.share_with_us],
        ["Missing from the menu", row.unavailable_items],
        ["Complaints", row.complaints_guest_issues],
        ["Needs fixing", row.equipment_needs_fixing],
        ["What went well", row.what_went_well],
        ["Note to tomorrow's shift", row.notes_for_next_shift],
      ].filter(([, v]) => v);
      const d = new Date(date);
      const { error: mailError } = await resend.emails.send({
        from: "Mama Till <team@mama.is>",
        to: [TO],
        subject: `Shift report ${d.getDate()}/${d.getMonth() + 1} · ${row.shift} · ${leader}`,
        text: [`Shift report from ${leader} · ${date} · ${row.shift}`, "", ...lines.map(([k, v]) => `${k}: ${v}`), "", "Sent from the till."].join("\n"),
        html: `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1c1c1c;max-width:520px">
<p style="font-size:18px;font-weight:600;margin:0 0 4px">Shift report</p>
<p style="font-size:14px;color:#6b6b6b;margin:0 0 16px">${escape(leader)} · ${escape(date)} · ${escape(row.shift)}</p>
${lines.map(([k, v]) => `<p style="margin:0 0 12px"><span style="display:block;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#8a8a8a">${escape(k)}</span><span style="font-size:15px;white-space:pre-wrap">${escape(v)}</span></p>`).join("")}
<p style="font-size:12px;color:#8a8a8a;margin:16px 0 0">Sent from the till.</p></div>`,
      });
      if (mailError) throw mailError;
    } catch (mailErr) {
      console.error("pos shift report: email failed (report was saved)", mailErr);
      emailSent = false;
    }

    return json({ ok: true, emailSent });
  } catch (err) {
    console.error("pos shift report failed", err);
    return json({ error: "Could not save the report" }, { status: 500 });
  }
}
