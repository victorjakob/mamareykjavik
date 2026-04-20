// POST /api/sendgrid/gatekeeper-wrap
// Body: { event_id: uuid }  -- the event whose wrap-up email to send
//
// Used by the cron job (and optionally manually from the reconciliation
// screen via a "send me the wrap now" button). Auth via CRON_SECRET OR
// a valid session whose user manages the event.

import { Resend } from "resend";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import { buildReport } from "@/app/api/events/gatekeeper/[slug]/report/buildReport";

const resend = new Resend(process.env.RESEND_API_KEY);

function isAuthorizedCron(req) {
  const authHeader = req.headers.get("authorization");
  return !!process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ message: "Invalid JSON" }), { status: 400 });
  }

  if (!body.event_id) {
    return new Response(JSON.stringify({ message: "event_id required" }), { status: 400 });
  }

  const supabase = createServerSupabase();

  const { data: event, error: evErr } = await supabase
    .from("events")
    .select("id, name, slug, date, host, host_secondary, price")
    .eq("id", body.event_id)
    .maybeSingle();
  if (evErr) return new Response(JSON.stringify({ message: evErr.message }), { status: 500 });
  if (!event) return new Response(JSON.stringify({ message: "Event not found" }), { status: 404 });

  // Auth: either the CRON secret OR a logged-in manager of this event.
  if (!isAuthorizedCron(req)) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }
    const email = (session.user.email || "").toLowerCase();
    const isManager =
      session.user.role === "admin" ||
      (event.host || "").toLowerCase() === email ||
      (event.host_secondary || "").toLowerCase() === email;
    if (!isManager) {
      return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });
    }
  }

  try {
    const report = await buildReport(supabase, event);
    const html = renderWrapHtml({ event, report });

    const recipients = Array.from(
      new Set(
        [event.host, event.host_secondary]
          .map((e) => (typeof e === "string" ? e.trim() : ""))
          .filter(Boolean)
      )
    );
    if (recipients.length === 0) {
      return new Response(JSON.stringify({ message: "No recipients" }), { status: 400 });
    }

    await resend.emails.send({
      from: "Mama Reykjavik <team@mama.is>",
      to: recipients,
      subject: `Your ${event.name} recap ✨`,
      html,
    });

    await supabase
      .from("gatekeeper_configs")
      .update({ wrap_sent_at: new Date().toISOString() })
      .eq("event_id", event.id);

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("Gatekeeper wrap email failed:", err);
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
}

function renderWrapHtml({ event, report }) {
  const { totals, walkIns } = report;
  const date = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // Palette mirrors src/.../ui.jsx TONE — bone, ink, bronze, moss.
  const C = {
    paper:  "#f7f2e8",
    bone:   "#f7f2e8",
    warm:   "#efe7d5",
    cream:  "#ede4d2",
    ink:    "#241810",
    sepia:  "#6f523a",
    muted:  "#9a8772",
    line:   "#e5d9c4",
    bronze: "#9a744a",
  };

  const methodRows = Object.entries(totals.byMethod)
    .map(([key, v]) => {
      const label =
        key === "online" ? "Online (pre-paid)" :
        key === "cash" ? "Cash" :
        key === "pos" ? "POS / Card" :
        key === "transfer" ? "Bank transfer" :
        key === "exchange" ? "Exchange" :
        key === "door" ? "Door" : key;
      return `
        <tr style="border-top:1px solid ${C.line};">
          <td style="padding:12px 20px; color:${C.ink}; font-size:14px;">${label}</td>
          <td style="padding:12px 20px; color:${C.ink}; font-size:14px; text-align:right; font-variant-numeric:tabular-nums;">${v.tickets}</td>
          <td style="padding:12px 20px; color:${C.ink}; font-size:14px; text-align:right; font-variant-numeric:tabular-nums;">${Number(v.revenue).toLocaleString()} ISK</td>
        </tr>`;
    })
    .join("");

  const walkInRows = walkIns
    .map((w, i) => `
      <tr style="${i === 0 ? "" : `border-top:1px solid ${C.line};`}">
        <td style="padding:10px 20px; color:${C.ink}; font-size:13px;">${escapeHtml(w.name)}</td>
        <td style="padding:10px 20px; color:${C.muted}; font-size:12px; text-transform:uppercase; letter-spacing:2px;">${escapeHtml(w.method)}</td>
        <td style="padding:10px 20px; color:${C.ink}; font-size:13px; text-align:right; font-variant-numeric:tabular-nums;">${Number(w.total).toLocaleString()} ISK</td>
      </tr>`)
    .join("");

  const checkedInPct =
    totals.tickets > 0 ? Math.round((totals.checkedIn / totals.tickets) * 100) : 0;

  // Static ensō — an open brushed circle, used as a quiet watermark. Email
  // clients strip animation; we draw it once, slightly rotated, with a gap.
  const enso = `
    <svg width="220" height="220" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="display:block;">
      <g transform="rotate(-105 60 60)">
        <circle cx="60" cy="60" r="52" fill="none" stroke="${C.bronze}" stroke-width="1.2" opacity="0.18"
          stroke-linecap="round" stroke-dasharray="304 22" />
      </g>
    </svg>`;

  return `
<div style="font-family:'Helvetica Neue', Arial, sans-serif; background:${C.cream}; padding:32px 16px;">
  <div style="max-width:620px; margin:0 auto; background:${C.paper}; border:1px solid ${C.line}; border-radius:24px; overflow:hidden;">

    <!-- Hero: ink on bone, ensō watermark to the right -->
    <div style="position:relative; padding:44px 32px 36px; text-align:center;">
      <div style="position:absolute; top:-30px; right:-40px; opacity:1;">${enso}</div>
      <p style="position:relative; margin:0 0 14px; font-size:11px; letter-spacing:6px; text-transform:uppercase; color:${C.bronze};">
        The evening, held
      </p>
      <div style="position:relative; display:inline-flex; align-items:center; gap:10px; margin-bottom:18px;">
        <span style="display:inline-block; width:38px; height:1px; background:${C.bronze}; opacity:0.55;"></span>
        <span style="display:inline-block; width:5px; height:5px; border-radius:50%; background:${C.bronze};"></span>
        <span style="display:inline-block; width:38px; height:1px; background:${C.bronze}; opacity:0.55;"></span>
      </div>
      <h1 style="position:relative; font-family:Georgia, serif; font-weight:200; font-style:italic; font-size:34px; margin:0; line-height:1.15; color:${C.ink};">
        ${escapeHtml(event.name)}
      </h1>
      <p style="position:relative; margin:14px 0 0; font-family:Georgia, serif; font-style:italic; font-size:14px; color:${C.sepia};">${date}</p>
    </div>

    <!-- Stats: four quiet pillars, separated by hairlines, no cards -->
    <div style="border-top:1px solid ${C.line}; background:${C.paper};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          ${bigStat(C, "In the room", totals.checkedIn, `${checkedInPct}% of ${totals.tickets}`, true)}
          ${bigStat(C, "At the door", totals.walkIns, "walk-ins")}
          ${bigStat(C, "Revenue", Number(totals.revenue).toLocaleString(), "ISK collected")}
          ${bigStat(C, "Tips", Number(totals.tipsTotal).toLocaleString(), `ISK · ${totals.tippers} offered`)}
        </tr>
      </table>
    </div>

    <div style="padding:8px 28px 28px;">
      <h2 style="font-family:Georgia, serif; font-weight:200; font-style:italic; font-size:22px; color:${C.ink}; margin:32px 0 6px;">
        By payment method
      </h2>
      <p style="margin:0 0 14px; color:${C.muted}; font-size:13px;">Every walk-in is saved in your attendee list.</p>
      <table style="width:100%; border-collapse:collapse; background:${C.paper}; border:1px solid ${C.line}; border-radius:16px; overflow:hidden;">
        <thead>
          <tr style="background:${C.warm};">
            <th style="text-align:left; padding:12px 20px; font-size:10px; letter-spacing:3px; color:${C.sepia}; text-transform:uppercase; font-weight:600;">Method</th>
            <th style="text-align:right; padding:12px 20px; font-size:10px; letter-spacing:3px; color:${C.sepia}; text-transform:uppercase; font-weight:600;">Tickets</th>
            <th style="text-align:right; padding:12px 20px; font-size:10px; letter-spacing:3px; color:${C.sepia}; text-transform:uppercase; font-weight:600;">Revenue</th>
          </tr>
        </thead>
        <tbody>${methodRows || `<tr><td colspan="3" style="padding:24px; color:${C.muted}; text-align:center; font-size:13px;">No sales recorded.</td></tr>`}</tbody>
      </table>

      ${walkIns.length > 0 ? `
      <h2 style="font-family:Georgia, serif; font-weight:200; font-style:italic; font-size:22px; color:${C.ink}; margin:32px 0 6px;">
        Walk-ins tonight
      </h2>
      <p style="margin:0 0 14px; color:${C.muted}; font-size:13px;">${walkIns.length} ${walkIns.length === 1 ? "person" : "people"} added at the door.</p>
      <table style="width:100%; border-collapse:collapse; background:${C.paper}; border:1px solid ${C.line}; border-radius:16px; overflow:hidden;">
        <tbody>${walkInRows}</tbody>
      </table>
      ` : ""}

      <p style="margin:36px 0 0; font-family:Georgia, serif; font-style:italic; color:${C.sepia}; font-size:16px; line-height:1.7; text-align:center;">
        Thank you for holding this threshold. Every person who walked through tonight is part of the circle now — their emails are saved, so you can keep it open.
      </p>

      <p style="margin:22px 0 0; text-align:center; font-size:11px; color:${C.muted}; letter-spacing:3px; text-transform:uppercase;">
        With warmth · the Mama team
      </p>
    </div>
  </div>
</div>`;
}

function bigStat(C, label, value, sub, first) {
  // Quiet pillar. Vertical hairline separates from neighbour; the first
  // cell in the row suppresses it so the row reads as a single line.
  return `
    <td style="padding:22px 8px; text-align:center; vertical-align:top; ${first ? "" : `border-left:1px solid ${C.line};`}">
      <p style="margin:0; color:${C.bronze}; font-size:9px; letter-spacing:4px; text-transform:uppercase;">${escapeHtml(label)}</p>
      <p style="margin:10px 0 4px; font-family:Georgia, serif; font-weight:200; font-style:italic; font-size:26px; color:${C.ink}; font-variant-numeric:tabular-nums;">${escapeHtml(String(value))}</p>
      <p style="margin:0; color:${C.muted}; font-size:11px;">${escapeHtml(sub)}</p>
    </td>`;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}
