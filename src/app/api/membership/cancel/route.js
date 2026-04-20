// POST /api/membership/cancel
// -----------------------------------------------------------------------------
// Cancel-at-period-end. The member keeps benefits until current_period_end;
// no charge happens on the renewal date; the cron flips the row to
// 'canceled' after the period passes.
//
// Auth required. Idempotent: if already cancel_at_period_end'd, returns ok.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import { sendCancellationScheduledEmail } from "@/lib/membershipEmails";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }
    const email = String(session.user.email).trim().toLowerCase();

    const supabase = createServerSupabase();

    const { data: sub } = await supabase
      .from("membership_subscriptions")
      .select("id, member_name, tier, status, current_period_end, cancel_at_period_end")
      .eq("member_email", email)
      .in("status", ["active", "grace_period", "paused"])
      .maybeSingle();

    if (!sub) {
      return NextResponse.json({ error: "No active membership found." }, { status: 404 });
    }

    if (sub.tier === "free") {
      // Free tier has no billing — cancellation is just deactivation.
      await supabase.from("membership_subscriptions")
        .update({ status: "canceled", canceled_at: new Date().toISOString() })
        .eq("id", sub.id);

      await supabase.from("membership_payment_events").insert({
        subscription_id: sub.id,
        member_email:    email,
        event_type:      "subscription_canceled",
        message:         "Free tier canceled by member.",
      });

      return NextResponse.json({ ok: true, immediate: true });
    }

    // Paid tiers: flag cancel-at-period-end. Cron will finalise.
    if (!sub.cancel_at_period_end) {
      await supabase.from("membership_subscriptions")
        .update({ cancel_at_period_end: true })
        .eq("id", sub.id);

      await supabase.from("membership_payment_events").insert({
        subscription_id: sub.id,
        member_email:    email,
        event_type:      "subscription_canceled",
        message:         "Cancel-at-period-end requested by member.",
      });

      try {
        await sendCancellationScheduledEmail({
          to:          email,
          name:        sub.member_name,
          activeUntil: sub.current_period_end,
          tier:        sub.tier,
        });
      } catch (mailErr) {
        console.error("sendCancellationScheduledEmail failed for", sub.id, mailErr);
      }
    }

    return NextResponse.json({
      ok: true,
      activeUntil: sub.current_period_end,
    });
  } catch (err) {
    console.error("POST /api/membership/cancel failed:", err);
    return NextResponse.json({ error: err?.message || "Cancel failed." }, { status: 500 });
  }
}
