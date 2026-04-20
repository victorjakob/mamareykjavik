// POST /api/admin/memberships/[id]/comp
// -----------------------------------------------------------------------------
// Admin action — comp a paid member N extra days (default 30). Pushes
// current_period_end + next_billing_date forward, extends the tribe card's
// expiry, and logs an audit event. Does NOT charge anything.
//
// Typical use: gifting a month to a friend, or apologising for a service
// hiccup. The comp survives cancellations: if the member has cancel_at_period_end
// set, the new period end gets used by the cron's finalisation branch.
//
// Body: { days?: number } — positive integer, defaults to 30, max 365.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import { mergeTribeCardExtension } from "@/lib/membershipTeya";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") return { ok: false };
  return { ok: true, session };
}

export async function POST(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const days = Math.max(1, Math.min(365, Number(body?.days || 30) || 30));

  const supabase = createServerSupabase();

  const { data: sub, error } = await supabase
    .from("membership_subscriptions")
    .select("id, member_email, tier, status, current_period_end, next_billing_date, tribe_card_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  if (sub.tier === "free") {
    return NextResponse.json({ error: "Free memberships can't be comped." }, { status: 400 });
  }

  // Anchor the extension off whichever is later — current period end or now.
  // That way comping a past_due member gives them genuinely N days from today,
  // not N days from whenever their last period ended.
  const now = new Date();
  const anchor = sub.current_period_end && new Date(sub.current_period_end) > now
    ? new Date(sub.current_period_end)
    : now;
  const newEnd = new Date(anchor);
  newEnd.setDate(newEnd.getDate() + days);

  await supabase.from("membership_subscriptions").update({
    status:             "active", // comp reactivates past_due / grace_period subs
    current_period_end: newEnd.toISOString(),
    next_billing_date:  newEnd.toISOString(),
  }).eq("id", sub.id);

  // Bump the tribe card expiry too — but only forward, never shorten.
  let cardAction = null;
  if (sub.tribe_card_id) {
    const { data: card } = await supabase
      .from("tribe_cards")
      .select("id, status, source, discount_percent, duration_type, expires_at, previous_state")
      .eq("id", sub.tribe_card_id)
      .maybeSingle();
    if (card) {
      const merged = mergeTribeCardExtension(
        card,
        { expires_at: newEnd.toISOString() },
        { operation: "renew" },
      );
      if (merged.update) {
        await supabase.from("tribe_cards").update(merged.update).eq("id", sub.tribe_card_id);
        cardAction = merged.type;
      }
    }
  }

  await supabase.from("membership_payment_events").insert({
    subscription_id: sub.id,
    member_email:    sub.member_email,
    event_type:      "admin_comp",
    message:         `Admin ${auth.session.user?.email || "unknown"} comped ${days} day${days === 1 ? "" : "s"}. New period end: ${newEnd.toISOString().slice(0, 10)}.`,
  });

  return NextResponse.json({
    ok: true,
    days,
    newPeriodEnd: newEnd.toISOString(),
    cardAction,
  });
}
