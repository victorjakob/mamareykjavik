// GET /api/admin/memberships
// -----------------------------------------------------------------------------
// Admin-only list of membership_subscriptions + roll-up counts for the CMS
// dashboard. Never returns card tokens.
//
// Query params (all optional):
//   ?status=active,grace_period        (comma-separated allowlist)
//   ?tier=tribe                         (single tier filter)
//   ?q=substring                        (email/name contains)
//   ?limit=200                          (default 500, max 1000)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return { ok: false };
  }
  return { ok: true, session };
}

const VALID_STATUSES = [
  "pending_payment",
  "active",
  "grace_period",
  "paused",
  "past_due",
  "canceled",
];
const VALID_TIERS = ["free", "tribe", "patron"];

export async function GET(req) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilterRaw = searchParams.get("status") || "";
  const tierFilter = (searchParams.get("tier") || "").toLowerCase();
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const limit = Math.min(
    Number(searchParams.get("limit") || 500) || 500,
    1000,
  );

  const statusFilter = statusFilterRaw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => VALID_STATUSES.includes(s));

  const supabase = createServerSupabase();

  let query = supabase
    .from("membership_subscriptions")
    .select(`
      id, member_email, member_name, user_id, tier, price_amount, currency,
      interval_unit, status, current_period_start, current_period_end,
      next_billing_date, cancel_at_period_end, canceled_at, created_at,
      tribe_card_id
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (statusFilter.length) query = query.in("status", statusFilter);
  if (VALID_TIERS.includes(tierFilter)) query = query.eq("tier", tierFilter);
  if (q) {
    // ilike on email OR name. Supabase-js has `or()` for that.
    const safe = q.replace(/[%,]/g, "");
    query = query.or(`member_email.ilike.%${safe}%,member_name.ilike.%${safe}%`);
  }

  const { data: rows, error } = await query;
  if (error) {
    console.error("admin memberships list error:", error);
    return NextResponse.json({ error: "Failed to fetch memberships" }, { status: 500 });
  }

  // Roll-up counts across all memberships (not the filtered slice) so the
  // dashboard summary doesn't shift when the operator applies a filter.
  const { data: allRows } = await supabase
    .from("membership_subscriptions")
    .select("id, tier, status, price_amount, currency");

  const totals = {
    all: allRows?.length || 0,
    byStatus: {},
    byTier:   {},
    mrrIsk:   0,  // active/grace paid ISK only
  };

  for (const r of allRows || []) {
    totals.byStatus[r.status] = (totals.byStatus[r.status] || 0) + 1;
    totals.byTier[r.tier]     = (totals.byTier[r.tier] || 0) + 1;
    if (
      ["active", "grace_period"].includes(r.status) &&
      r.tier !== "free" &&
      (r.currency || "ISK") === "ISK"
    ) {
      totals.mrrIsk += Number(r.price_amount || 0);
    }
  }

  return NextResponse.json({ memberships: rows || [], totals });
}
