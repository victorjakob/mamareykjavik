// POST /api/admin/memberships/[id]/retry
// -----------------------------------------------------------------------------
// Admin action — force a renewal attempt right now for one subscription,
// regardless of its next_billing_date. Uses the exact same renewOne()
// logic the Vercel cron uses, so the state machine stays single-sourced.
//
// Useful when a member pays their card off and texts you "please try again"
// without waiting for the next scheduled retry.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import { renewOne } from "@/lib/membershipRenew";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") return { ok: false };
  return { ok: true, session };
}

export async function POST(_req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = createServerSupabase();

  const { data: sub, error } = await supabase
    .from("membership_subscriptions")
    .select(`
      id, member_email, member_name, user_id, tier, price_amount, currency, status,
      current_period_start, current_period_end, next_billing_date,
      cancel_at_period_end, tribe_card_id
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !sub) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }
  if (sub.tier === "free") {
    return NextResponse.json({ error: "Free memberships don't have renewals." }, { status: 400 });
  }

  // Log that an admin kicked this retry — helps distinguish from cron-triggered
  // attempts in the audit trail.
  await supabase.from("membership_payment_events").insert({
    subscription_id: sub.id,
    member_email:    sub.member_email,
    event_type:      "admin_retry_triggered",
    message:         `Admin ${auth.session.user?.email || "unknown"} triggered a manual retry.`,
  });

  try {
    const result = await renewOne(supabase, sub, new Date());
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("admin retry crashed for", sub.id, err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
