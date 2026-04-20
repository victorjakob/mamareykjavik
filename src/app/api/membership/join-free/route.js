// POST /api/membership/join-free
// -----------------------------------------------------------------------------
// Instant activation of the Free tier — no payment, no Teya, no tribe card.
// Free members get: newsletter subscription, early event visibility,
// community updates. They do NOT get a discount card (that's the Tribe /
// Patron paid perk).
//
// Auth required. Idempotent: if the user already has any membership row,
// we return the existing one without creating a duplicate.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please sign in to join." }, { status: 401 });
    }

    const email = String(session.user.email).trim().toLowerCase();
    const name  = session.user.name || "";

    const supabase = createServerSupabase();

    // If they already have any non-terminal membership, short-circuit.
    const { data: existing } = await supabase
      .from("membership_subscriptions")
      .select("id, tier, status")
      .eq("member_email", email)
      .in("status", ["active", "grace_period", "paused", "pending_payment"])
      .maybeSingle();

    if (existing) {
      // If they're already on a paid tier, don't downgrade them silently.
      if (existing.tier !== "free") {
        return NextResponse.json(
          { ok: true, alreadyActive: true, tier: existing.tier, subscriptionId: existing.id },
          { status: 200 },
        );
      }
      return NextResponse.json({ ok: true, tier: "free", subscriptionId: existing.id });
    }

    // Look up user_id for the join back to auth.
    const { data: userRow } = await supabase
      .from("users")
      .select("id, name")
      .eq("email", email)
      .maybeSingle();

    const now = new Date();
    // Free memberships don't bill, but we still set a 1-year "period" for
    // cosmetic consistency in /profile and admin views.
    const periodEnd = new Date(now);
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    const { data: sub, error: insErr } = await supabase
      .from("membership_subscriptions")
      .insert({
        member_email: email,
        member_name:  name || userRow?.name || "",
        user_id:      userRow?.id || null,
        tier:         "free",
        price_amount: 0,
        currency:     "ISK",
        interval_unit:"year",
        status:       "active",
        current_period_start: now.toISOString(),
        current_period_end:   periodEnd.toISOString(),
        next_billing_date:    null,
      })
      .select("id")
      .single();

    if (insErr || !sub) {
      console.error("Free membership insert failed:", insErr);
      return NextResponse.json({ error: "Could not activate free membership." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, tier: "free", subscriptionId: sub.id });
  } catch (err) {
    console.error("POST /api/membership/join-free failed:", err);
    return NextResponse.json({ error: err?.message || "Activation failed." }, { status: 500 });
  }
}
