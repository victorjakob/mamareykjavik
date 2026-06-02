// POST /api/admin/summer-market/send-weekend-welcome
//
// Sends the warm "see you this weekend" email to every accepted vendor whose
// selected_dates include any of the dates passed in the body. Idempotent:
// vendors with weekend_welcome_sent_at already set are skipped.
//
// Authorization (either of):
//   - Bearer ${CRON_SECRET}  (for curl / cron triggers)
//   - Authenticated admin or host NextAuth session  (for the admin UI button)
//
// Body (JSON):
//   {
//     "dates":         ["Fri June 5", "Sat June 6", "Sun June 7"],
//     "excludeEmails": ["viggijakob@gmail.com"]     // optional
//     "dryRun":        false                         // optional, default false
//   }
//
// Response:
//   {
//     "ok": true,
//     "matched": 4,        // accepted vendors with any of the requested dates
//     "skipped": 0,        // already sent
//     "sent":    4,        // sent this run
//     "failed":  [],       // {email, error}[]
//     "vendors": [...]
//   }

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

const FROM = "Mama Reykjavík <hello@mail.mama.is>";
const REPLY_TO = "team@mama.is";

async function isAuthorized(req) {
  const h = req.headers.get("authorization");
  if (process.env.CRON_SECRET && h === `Bearer ${process.env.CRON_SECRET}`) {
    return true;
  }
  const session = await getServerSession(authOptions);
  return Boolean(
    session?.user &&
      (session.user.role === "admin" || session.user.role === "host"),
  );
}

function firstName(contact_person, brand_name) {
  const raw = (contact_person || brand_name || "").trim();
  if (!raw) return "friend";
  const first = raw.split(/\s+/)[0];
  return first || "friend";
}

export async function POST(req) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const dates = Array.isArray(body.dates) ? body.dates : [];
  if (dates.length === 0) {
    return NextResponse.json(
      { error: "Provide a non-empty `dates` array, e.g. [\"Sat June 6\"]" },
      { status: 400 },
    );
  }
  const excludeEmails = (Array.isArray(body.excludeEmails) ? body.excludeEmails : [])
    .map((e) => String(e).trim().toLowerCase())
    .filter(Boolean);
  const dryRun = body.dryRun === true;

  const supabase = createServerSupabase();
  const resend = createResend();

  const { data: vendors, error } = await supabase
    .from("summer_market_vendor_applications")
    .select(
      "id, brand_name, contact_person, email, selected_dates, weekend_welcome_sent_at",
    )
    .eq("status", "accepted")
    .overlaps("selected_dates", dates);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const matched = vendors || [];
  const skipped = [];
  const sent = [];
  const failed = [];

  for (const v of matched) {
    const emailLower = (v.email || "").trim().toLowerCase();
    if (!emailLower) {
      failed.push({ id: v.id, brand_name: v.brand_name, error: "missing email" });
      continue;
    }
    if (excludeEmails.includes(emailLower)) {
      skipped.push({ id: v.id, email: emailLower, reason: "excluded_by_caller" });
      continue;
    }
    if (v.weekend_welcome_sent_at) {
      skipped.push({
        id: v.id,
        email: emailLower,
        reason: "already_sent",
        sent_at: v.weekend_welcome_sent_at,
      });
      continue;
    }

    // Only show this vendor the dates from THIS weekend they booked,
    // not their whole booking history.
    const theirDatesThisWeekend = (v.selected_dates || []).filter((d) =>
      dates.includes(d),
    );

    if (dryRun) {
      sent.push({
        id: v.id,
        email: emailLower,
        brand_name: v.brand_name,
        dates: theirDatesThisWeekend,
        dryRun: true,
      });
      continue;
    }

    try {
      const { html, text, subject } = await renderEmail(
        "summer-market-weekend-welcome",
        {
          firstName: firstName(v.contact_person, v.brand_name),
          brandName: v.brand_name,
          dates: theirDatesThisWeekend,
          leonPhone: "616 7855",
          instagramHandle: "@mamareykjavik",
        },
      );

      await resend.emails.send({
        from: FROM,
        to: [emailLower],
        replyTo: REPLY_TO,
        subject: subject || "A warm welcome to the Mama Summer Market",
        html,
        text,
      });

      await supabase
        .from("summer_market_vendor_applications")
        .update({ weekend_welcome_sent_at: new Date().toISOString() })
        .eq("id", v.id);

      sent.push({
        id: v.id,
        email: emailLower,
        brand_name: v.brand_name,
        dates: theirDatesThisWeekend,
      });
    } catch (err) {
      console.error(
        "[admin/summer-market/send-weekend-welcome] send failed",
        v.id,
        err,
      );
      failed.push({
        id: v.id,
        email: emailLower,
        brand_name: v.brand_name,
        error: String(err?.message || err),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    matched: matched.length,
    sent_count: sent.length,
    skipped_count: skipped.length,
    failed_count: failed.length,
    sent,
    skipped,
    failed,
  });
}
