// POST /api/admin/summer-market/send-schedule-change
//
// Sends a warm change-of-plan email to every accepted vendor with the
// specified market date in their selected_dates. NOT deduplicated — the
// same day can have multiple changes (early close, weather, etc).
//
// Authorization (either of):
//   - Bearer ${CRON_SECRET}
//   - Authenticated admin or host NextAuth session
//
// Body (JSON):
//   {
//     "date":          "Sat June 6",                  // required
//     "originalTime":  "13:00 to 19:00",              // optional
//     "newTime":       "13:00 to 17:00",              // optional
//     "reason":        "Private event booked at...",  // optional
//     "accommodation": "You only pay the conf...",    // optional
//     "excludeEmails": ["viggijakob@gmail.com"],      // optional
//     "dryRun":        false                          // optional
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

  const date = typeof body.date === "string" ? body.date.trim() : "";
  if (!date) {
    return NextResponse.json(
      { error: "Provide a `date` (e.g. 'Sat June 6')" },
      { status: 400 },
    );
  }
  const originalTime = (body.originalTime || "").trim();
  const newTime = (body.newTime || "").trim();
  const reason = (body.reason || "").trim();
  const accommodation = (body.accommodation || "").trim();
  const excludeEmails = (Array.isArray(body.excludeEmails)
    ? body.excludeEmails
    : []
  )
    .map((e) => String(e).trim().toLowerCase())
    .filter(Boolean);
  const dryRun = body.dryRun === true;

  const supabase = createServerSupabase();
  const resend = createResend();

  const { data: vendors, error } = await supabase
    .from("summer_market_vendor_applications")
    .select("id, brand_name, contact_person, email, selected_dates")
    .eq("status", "accepted")
    .contains("selected_dates", [date]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const matched = vendors || [];
  const sent = [];
  const skipped = [];
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

    if (dryRun) {
      sent.push({
        id: v.id,
        email: emailLower,
        brand_name: v.brand_name,
        dryRun: true,
      });
      continue;
    }

    try {
      const { html, text, subject } = await renderEmail(
        "summer-market-schedule-change",
        {
          firstName: firstName(v.contact_person, v.brand_name),
          brandName: v.brand_name,
          affectedDate: date,
          originalTime,
          newTime,
          reason,
          accommodation,
          leonPhone: "616 7855",
        },
      );

      await resend.emails.send({
        from: FROM,
        to: [emailLower],
        replyTo: REPLY_TO,
        subject: subject || `A small change for ${date}`,
        html,
        text,
      });

      // Stamp the saturday breakdown column when the date is a Saturday and
      // it looks like an early-close notice; otherwise we don't dedupe.
      const isSaturdayBreakdown =
        date.toLowerCase().startsWith("sat") &&
        (newTime || reason).length > 0;
      if (isSaturdayBreakdown) {
        await supabase
          .from("summer_market_vendor_applications")
          .update({ saturday_breakdown_notice_sent_at: new Date().toISOString() })
          .eq("id", v.id);
      }

      sent.push({
        id: v.id,
        email: emailLower,
        brand_name: v.brand_name,
      });
    } catch (err) {
      console.error(
        "[admin/summer-market/send-schedule-change] send failed",
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
    date,
    matched: matched.length,
    sent_count: sent.length,
    skipped_count: skipped.length,
    failed_count: failed.length,
    sent,
    skipped,
    failed,
  });
}
