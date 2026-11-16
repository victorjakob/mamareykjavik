// One reminder per table booking, the day before.
//
// Schedule: hourly at :25. Hourly rather than daily because the setting is in
// hours — booking_settings.reminder_hours_before, 24 by default — and a daily
// sweep could only ever honour it as "some time the previous morning". On the
// hour it lands within an hour of the number Victor set, whatever he sets it
// to. Null in that column switches reminders off entirely.
//
// Authorization: Bearer ${CRON_SECRET}, as every other cron here.
//
// Three things stop a guest being emailed twice or wrongly:
//
//   • reminder_sent_at is stamped before the next row is considered, so a
//     re-run, a retry or two overlapping invocations send nothing again.
//   • a booking made inside its own reminder window is skipped. Somebody who
//     booked at four for a table at seven does not need reminding at five.
//   • RESTAURANT_BOOKING_OPEN gates the whole sweep. Before cut-over the
//     table holds Dineout's imported bookings, and Dineout is still sending
//     those guests its own reminders; two would be worse than none.
//
// Nothing here can fail a booking: the booking is already made. A send that
// fails is logged, left unstamped, and tried again on the next pass.

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";
import { runWithLogging } from "@/lib/cronLog";
import { bookingOpen } from "@/lib/restaurant/open";
import { dayLabel, reminderDue } from "@/lib/restaurant/reminders";

const FROM = "Mama Reykjavík <team@mama.is>";
const HOUR = 60 * 60 * 1000;

const baseUrl = () =>
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "https://mama.is";

/*
  One line each, rather than the template's own `.subject`, because the subject
  carries the time and the guest's language — and, like the greeting inside,
  which day it lands on.
*/
const SUBJECT = {
  en: {
    today: (d, t) => `Today at Mama — ${t}`,
    tomorrow: (d, t) => `Tomorrow at Mama — ${t}`,
    later: (d, t) => `Your table at Mama — ${d}, ${t}`,
  },
  is: {
    today: (d, t) => `Í dag á Mama — kl. ${t}`,
    tomorrow: (d, t) => `Á morgun á Mama — kl. ${t}`,
    later: (d, t) => `Borðið þitt á Mama — ${d} kl. ${t}`,
  },
};

const authorized = (req) =>
  !!process.env.CRON_SECRET &&
  req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;

async function sweep(req) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!bookingOpen()) {
    return NextResponse.json({ ok: true, skipped: "bookings not open" });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 });
  }

  const supabase = createServerSupabase();
  const resend = createResend();

  const { data: settings } = await supabase
    .from("booking_settings")
    .select("reminder_hours_before")
    .eq("id", 1)
    .maybeSingle();

  const hours = settings?.reminder_hours_before;
  if (!hours) return NextResponse.json({ ok: true, skipped: "reminders off" });

  const now = Date.now();

  /*
    The day either side of the reminder point, by date, so the query is small
    and the index on (booking_date, booking_time) does the work. The exact
    cut is made per row below, against the real start time.
  */
  const day = (ms) => new Date(ms).toISOString().slice(0, 10);

  const { data: rows, error } = await supabase
    .from("restaurant_bookings")
    .select(
      "id, reference_id, booking_date, booking_time, party, contact_name, contact_email, request, access_token, language, status, created_at",
    )
    .gte("booking_date", day(now))
    .lte("booking_date", day(now + hours * HOUR + 24 * HOUR))
    .is("reminder_sent_at", null)
    .is("hidden_at", null)
    .in("status", ["new", "confirmed"])
    .not("contact_email", "is", null);

  if (error) {
    console.error("[cron/booking-reminders] fetch failed", error);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }

  const stats = { sent: 0, tooEarly: 0, bookedLate: 0, past: 0, failed: 0 };

  const stamp = (id) =>
    supabase
      .from("restaurant_bookings")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", id);

  for (const row of rows ?? []) {
    const due = reminderDue(row, hours, now);

    // Neither of these will ever come due, so they are stamped rather than
    // left to be reconsidered every hour for the rest of the week.
    if (due === "past" || due === "late-booking") {
      stats[due === "past" ? "past" : "bookedLate"] += 1;
      await stamp(row.id);
      continue;
    }
    if (due === "early") {
      stats.tooEarly += 1;
      continue;
    }

    const language = row.language === "is" ? "is" : "en";
    const time = String(row.booking_time).slice(0, 5);
    // How far ahead the reminder goes is a setting, so the email cannot
    // assume "tomorrow". Both the greeting and the subject follow the day.
    const when = dayLabel(row, now);

    try {
      const { html, text } = await renderEmail("table-booking-reminder", {
        name: row.contact_name,
        date: row.booking_date,
        time,
        party: row.party,
        reference: row.reference_id,
        request: row.request,
        manageUrl: row.access_token
          ? `${baseUrl()}/booking/${row.access_token}`
          : null,
        language,
        when,
      });

      await resend.emails.send({
        from: FROM,
        to: [row.contact_email],
        subject: SUBJECT[language][when](row.booking_date, time),
        html,
        text,
      });

      await stamp(row.id);
      stats.sent += 1;
    } catch (err) {
      // Left unstamped on purpose: the next pass tries again.
      console.error("[cron/booking-reminders] send failed", row.reference_id, err);
      stats.failed += 1;
    }
  }

  return NextResponse.json({ ok: true, hours, considered: rows?.length ?? 0, ...stats });
}

export async function GET(req) {
  return runWithLogging("cron-booking-reminders", req, () => sweep(req));
}

export async function POST(req) {
  return runWithLogging("cron-booking-reminders", req, () => sweep(req));
}
