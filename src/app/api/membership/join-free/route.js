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
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import { addToList } from "@/lib/subscribers";
import { sendWelcomeCommunityEmail } from "@/lib/membershipEmails";

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

    // Free memberships don't bill and never expire, so the period fields
    // stay null (there's no real period). The UI renders "Always" / "∞" for
    // free members and the admin view shows "—"; the renewal cron only ever
    // looks at next_billing_date, which is null here too.
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
        current_period_start: null,
        current_period_end:   null,
        next_billing_date:    null,
      })
      .select("id")
      .single();

    if (insErr || !sub) {
      console.error("Free membership insert failed:", insErr);
      return NextResponse.json({ error: "Could not activate free membership." }, { status: 500 });
    }

    // Free members get the newsletter (as promised on the join page). Best
    // effort — never fail the join if the list/Resend call hiccups.
    try {
      await addToList({
        email,
        name: name || userRow?.name || "",
        source: "member",
        consentBasis: "explicit_optin",
        supabase,
      });
    } catch (err) {
      console.error("join-free addToList failed:", err?.message || err);
    }

    // Welcome email — only reached on a genuinely new membership row (re-joins
    // short-circuit above). Best effort — never fail the join if Resend hiccups.
    try {
      await sendWelcomeCommunityEmail({ to: email, name: name || userRow?.name || "" });
    } catch (err) {
      console.error("join-free welcome email failed:", err?.message || err);
    }

    return NextResponse.json({ ok: true, tier: "free", subscriptionId: sub.id });
  } catch (err) {
    console.error("POST /api/membership/join-free failed:", err);
    return NextResponse.json({ error: err?.message || "Activation failed." }, { status: 500 });
  }
}
