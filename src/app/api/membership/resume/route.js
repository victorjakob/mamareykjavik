// POST /api/membership/resume
// -----------------------------------------------------------------------------
// Reverses a "cancel-at-period-end" while the member is still inside their
// paid period. They keep their existing current_period_end (no extra charge,
// no shift in dates) — we just clear the cancel flag so the cron will renew
// them as normal.
//
// Auth required. Idempotent: if already not cancel_at_period_end'd, no-ops
// and returns ok. Also no-ops cleanly if status has already moved past
// 'active' (e.g. the cron already finalised the cancel) — in that case we
// return 409 so the UI can refresh and show the now-canceled state.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }
    const email = String(session.user.email).trim().toLowerCase();

    const supabase = createServerSupabase();

    // We can only resume a subscription that's still active or in grace —
    // once the cron has flipped it to `canceled`, the member needs to
    // re-subscribe through checkout (different code path).
    const { data: sub } = await supabase
      .from("membership_subscriptions")
      .select("id, tier, status, current_period_end, cancel_at_period_end")
      .eq("member_email", email)
      .in("status", ["active", "grace_period", "paused"])
      .maybeSingle();

    if (!sub) {
      return NextResponse.json(
        {
          error:
            "Your membership has already ended. Please rejoin from the membership page.",
        },
        { status: 409 }
      );
    }

    if (sub.tier === "free") {
      // Free tier has no cancel-at-period-end concept; nothing to undo.
      return NextResponse.json({ ok: true, noop: true });
    }

    if (!sub.cancel_at_period_end) {
      // Already in good standing — idempotent ok.
      return NextResponse.json({ ok: true, noop: true });
    }

    await supabase
      .from("membership_subscriptions")
      .update({ cancel_at_period_end: false })
      .eq("id", sub.id);

    await supabase.from("membership_payment_events").insert({
      subscription_id: sub.id,
      member_email: email,
      event_type: "subscription_resumed",
      message: "Cancel-at-period-end reversed by member.",
    });

    return NextResponse.json({
      ok: true,
      activeUntil: sub.current_period_end,
    });
  } catch (err) {
    console.error("POST /api/membership/resume failed:", err);
    return NextResponse.json(
      { error: err?.message || "Resume failed." },
      { status: 500 }
    );
  }
}
