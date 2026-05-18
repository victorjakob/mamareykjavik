// Daily reminder cron for /private-session bookings.
//
// Schedule: 10:00 UTC (= 10:00 in Iceland, no DST).
// Authorization: Bearer ${CRON_SECRET}.
//
// For every confirmed booking whose session is 0..2 days away:
//
//   • Two days out, slot has no actual_location, no team alert yet
//     → email mama + team@whitelotus.is (+ practitioner notification_email)
//       with a "set the address" CTA. Stamps location_alert_sent_at.
//
//   • One day out, no day-before email yet
//     → email the attendee a reminder. Includes the address if it's set,
//       otherwise tells them it's coming shortly. Stamps day_before_email_sent_at.
//
//   • Day of, slot still has no actual_location, no day-of email yet
//     → courtesy "address coming shortly" to the attendee. Stamps
//       day_of_email_sent_at.
//
// Side-effects are idempotent per-row via the three timestamp columns —
// re-running the cron the same day is a no-op for already-handled rows.

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";
import { runWithLogging } from "@/lib/cronLog";

const FROM = "Mama Reykjavik <team@mama.is>";
const ADMIN_EMAIL =
  process.env.PRIVATE_SESSION_ADMIN_EMAIL || "mama.reykjavik@gmail.com";
const TEAM_CC = "team@whitelotus.is";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is";

function isAuthorized(req) {
  const authHeader = req.headers.get("authorization");
  return !!process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

function adminRecipients(practitionerNotificationEmail) {
  const list = [ADMIN_EMAIL, TEAM_CC, practitionerNotificationEmail || ""];
  const seen = new Set();
  return list
    .map((e) => (e || "").trim())
    .filter((e) => {
      if (!e) return false;
      const lower = e.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
}

function startOfUtcDay(d) {
  const c = new Date(d);
  return Date.UTC(c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate());
}

// Day distance in calendar days (Iceland is UTC year-round, so UTC math
// matches local-day reasoning for the deployment target).
function dayDiff(fromIso, nowIso) {
  return Math.floor((startOfUtcDay(new Date(fromIso)) - startOfUtcDay(new Date(nowIso))) / 86400000);
}

function fmtFullDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Per-day handlers ────────────────────────────────────────────────────────

async function fireTeamNeedsAddress({ supabase, resend, booking, slot, offering, practitioner }) {
  const reviewUrl = `${BASE_URL}/private-session/admin/bookings/${booking.id}`;
  const { html, text } = await renderEmail("private-session-needs-address-team", {
    clientName: booking.client_name,
    practitionerName: practitioner?.name || "Mama",
    offeringTitle: offering?.title || "Private session",
    startAt: slot.starts_at,
    bookingUrl: reviewUrl,
  });
  const subject = `[Private session] Set address — ${booking.client_name} · ${fmtFullDateTime(slot.starts_at)}`;
  await resend.emails.send({
    from: FROM,
    to: adminRecipients(practitioner?.notification_email),
    subject,
    html,
    text,
  });
  await supabase
    .from("private_session_bookings")
    .update({ location_alert_sent_at: new Date().toISOString() })
    .eq("id", booking.id);
}

async function fireAttendeeDayBefore({ supabase, resend, booking, slot, offering, practitioner }) {
  const { html, text } = await renderEmail("private-session-reminder-customer", {
    clientName: booking.client_name,
    practitionerName: practitioner?.name || "Mama",
    offeringTitle: offering?.title || "Private session",
    startAt: slot.starts_at,
    actualLocation: slot.actual_location || null,
  });
  const subject = slot.actual_location
    ? `Your session is tomorrow — ${practitioner?.name || "Mama"}`
    : "Your session is tomorrow — address coming shortly";
  await resend.emails.send({
    from: FROM,
    to: booking.client_email,
    subject,
    html,
    text,
  });
  await supabase
    .from("private_session_bookings")
    .update({ day_before_email_sent_at: new Date().toISOString() })
    .eq("id", booking.id);
}

async function fireAttendeeDayOf({ supabase, resend, booking, slot, offering, practitioner }) {
  const { html, text } = await renderEmail("private-session-day-of-no-address", {
    clientName: booking.client_name,
    practitionerName: practitioner?.name || "Mama",
    offeringTitle: offering?.title || "Private session",
    startAt: slot.starts_at,
  });
  const subject = "Your session today — address coming shortly";
  await resend.emails.send({
    from: FROM,
    to: booking.client_email,
    subject,
    html,
    text,
  });
  await supabase
    .from("private_session_bookings")
    .update({ day_of_email_sent_at: new Date().toISOString() })
    .eq("id", booking.id);
}

// ── Main sweep ──────────────────────────────────────────────────────────────

async function runReminderSweep(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 });
  }

  const supabase = createServerSupabase();
  const resend = createResend();

  // Fetch every confirmed booking whose slot starts in roughly [now, now+3d].
  // Inner join via Supabase nested select; we keep dayDiff for the day classifier.
  const nowIso = new Date().toISOString();
  const horizonIso = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const { data: bookings, error } = await supabase
    .from("private_session_bookings")
    .select(`
      id, client_name, client_email, status,
      confirmation_email_sent_at, day_before_email_sent_at,
      location_alert_sent_at, day_of_email_sent_at,
      private_session_slots ( id, starts_at, actual_location, practitioner_id, published_area ),
      private_session_offerings ( id, title, duration_minutes )
    `)
    .eq("status", "confirmed");

  if (error) {
    console.error("[cron/private-session-reminders] fetch failed", error);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }

  const withinHorizon = (bookings || []).filter((b) => {
    const starts = b.private_session_slots?.starts_at;
    return starts && starts >= nowIso && starts <= horizonIso;
  });

  // Pre-fetch practitioners in one query.
  const practitionerIds = Array.from(
    new Set(withinHorizon.map((b) => b.private_session_slots?.practitioner_id).filter(Boolean))
  );
  const practitioners = new Map();
  if (practitionerIds.length > 0) {
    const { data: rows } = await supabase
      .from("private_session_practitioners")
      .select("id, name, slug, notification_email")
      .in("id", practitionerIds);
    for (const p of rows || []) practitioners.set(p.id, p);
  }

  const stats = { teamAlerts: 0, dayBefore: 0, dayOf: 0, skipped: 0, errors: 0 };

  for (const booking of withinHorizon) {
    const slot = booking.private_session_slots || {};
    const offering = booking.private_session_offerings || {};
    const practitioner = practitioners.get(slot.practitioner_id) || null;
    const diff = dayDiff(slot.starts_at, nowIso);

    try {
      // T-2 team alert (only if no address + not yet sent)
      if (diff === 2 && !slot.actual_location && !booking.location_alert_sent_at) {
        await fireTeamNeedsAddress({ supabase, resend, booking, slot, offering, practitioner });
        stats.teamAlerts += 1;
        continue;
      }
      // T-1 attendee reminder (only if not yet sent)
      if (diff === 1 && !booking.day_before_email_sent_at) {
        await fireAttendeeDayBefore({ supabase, resend, booking, slot, offering, practitioner });
        stats.dayBefore += 1;
        continue;
      }
      // T-0 fallback (only if no address + not yet sent)
      if (diff === 0 && !slot.actual_location && !booking.day_of_email_sent_at) {
        await fireAttendeeDayOf({ supabase, resend, booking, slot, offering, practitioner });
        stats.dayOf += 1;
        continue;
      }
      stats.skipped += 1;
    } catch (err) {
      console.error(
        `[cron/private-session-reminders] booking=${booking.id} diff=${diff} failed`,
        err
      );
      stats.errors += 1;
    }
  }

  return NextResponse.json({ ok: true, ...stats });
}

export async function GET(req) {
  return runWithLogging("cron-private-session-reminders", req, () => runReminderSweep(req));
}

export async function POST(req) {
  return runWithLogging("cron-private-session-reminders", req, () => runReminderSweep(req));
}
