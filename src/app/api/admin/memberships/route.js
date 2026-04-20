// GET /api/admin/memberships
// -----------------------------------------------------------------------------
// Admin-only, single-fetch dashboard data. Returns:
//
//   memberships : filtered sub rows (for the main table)
//   totals      : {
//     all, byStatus, byTier, mrrIsk,
//     pastDue, gracePeriod, endingSoon, noCardOnFile,       // attention bar
//     mrrLastMonthIsk, newMembers30d, churned30d,           // MRR momentum
//     paidMembersWeekly: [{ weekStart, count }]             // 8-week sparkline
//   }
//   dunning     : grace_period subs with retry context (for the dunning queue)
//   activity    : last 15 events across all subs (for the live feed)
//
// Never returns card tokens.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") return { ok: false };
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

function startOfMonthUTC(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0));
}
function startOfWeekUTC(d) {
  // ISO weeks start Monday. JS getUTCDay: Sunday=0.
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const out = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  out.setUTCDate(out.getUTCDate() + diff);
  out.setUTCHours(0, 0, 0, 0);
  return out;
}
function daysAgoUTC(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function GET(req) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const statusFilterRaw = searchParams.get("status") || "";
  const tierFilter = (searchParams.get("tier") || "").toLowerCase();
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const limit = Math.min(Number(searchParams.get("limit") || 500) || 500, 1000);
  const statusFilter = statusFilterRaw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => VALID_STATUSES.includes(s));

  const supabase = createServerSupabase();
  const now = new Date();
  const thirtyDaysAgo = daysAgoUTC(30);
  const sixtyDaysAgo = daysAgoUTC(60);
  const monthStart = startOfMonthUTC(now);
  const lastMonthStart = startOfMonthUTC(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)));

  // ─── 1. Filtered table rows ──────────────────────────────────────────────
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
    const safe = q.replace(/[%,]/g, "");
    query = query.or(`member_email.ilike.%${safe}%,member_name.ilike.%${safe}%`);
  }

  const { data: rows, error } = await query;
  if (error) {
    console.error("admin memberships list error:", error);
    return NextResponse.json({ error: "Failed to fetch memberships" }, { status: 500 });
  }

  // ─── 2. Unfiltered snapshot — powers roll-ups and attention counters ─────
  const { data: allRows } = await supabase
    .from("membership_subscriptions")
    .select(`
      id, tier, status, price_amount, currency, next_billing_date,
      current_period_end, cancel_at_period_end, canceled_at, created_at
    `);

  const totals = {
    all: allRows?.length || 0,
    byStatus: {},
    byTier:   {},
    mrrIsk: 0,
    pastDue: 0,
    gracePeriod: 0,
    endingSoon: 0,
    noCardOnFile: 0,
    mrrLastMonthIsk: 0,
    newMembers30d: 0,
    churned30d: 0,
    paidMembersWeekly: [],
  };

  const paidCurrent = [];        // active/grace paid subs (for noCard lookup)
  const endingSoonIds = [];
  const noCardIds = [];

  const in30 = new Date(now);
  in30.setUTCDate(in30.getUTCDate() + 30);

  for (const r of allRows || []) {
    totals.byStatus[r.status] = (totals.byStatus[r.status] || 0) + 1;
    totals.byTier[r.tier]     = (totals.byTier[r.tier] || 0) + 1;

    const isPaidCurrent = ["active", "grace_period"].includes(r.status) && r.tier !== "free";
    if (isPaidCurrent && (r.currency || "ISK") === "ISK") {
      totals.mrrIsk += Number(r.price_amount || 0);
      paidCurrent.push(r);
    }

    if (r.status === "past_due" && r.canceled_at == null) totals.pastDue += 1;
    if (r.status === "grace_period") totals.gracePeriod += 1;

    if (
      r.cancel_at_period_end &&
      r.current_period_end &&
      new Date(r.current_period_end) >= now &&
      new Date(r.current_period_end) <= in30
    ) {
      totals.endingSoon += 1;
      endingSoonIds.push(r.id);
    }

    if (r.created_at && new Date(r.created_at) >= thirtyDaysAgo) {
      totals.newMembers30d += 1;
    }
    if (r.canceled_at && new Date(r.canceled_at) >= thirtyDaysAgo) {
      totals.churned30d += 1;
    }

    // MRR last month: subs that were paid-active before last-month-start and
    // were NOT canceled before month start. Approximation that matches what
    // most solo-operators actually care about: "what was my run-rate a month
    // ago, give or take a few cancellations in the window".
    if (
      r.tier !== "free" &&
      (r.currency || "ISK") === "ISK" &&
      r.created_at && new Date(r.created_at) < lastMonthStart &&
      (!r.canceled_at || new Date(r.canceled_at) > lastMonthStart) &&
      r.status !== "pending_payment"
    ) {
      totals.mrrLastMonthIsk += Number(r.price_amount || 0);
    }
  }

  // ─── 3. No-card-on-file attention count ──────────────────────────────────
  // Only meaningful for paid, currently-active-ish subs.
  if (paidCurrent.length > 0) {
    const { data: pms } = await supabase
      .from("membership_payment_methods")
      .select("subscription_id, virtual_card_number, rpg_multi_token, is_default")
      .in("subscription_id", paidCurrent.map((r) => r.id))
      .eq("is_default", true);

    const haveToken = new Set();
    for (const pm of pms || []) {
      if (pm.virtual_card_number || pm.rpg_multi_token) haveToken.add(pm.subscription_id);
    }
    for (const r of paidCurrent) {
      if (!haveToken.has(r.id)) noCardIds.push(r.id);
    }
    totals.noCardOnFile = noCardIds.length;
  }

  // ─── 4. Weekly paying-member sparkline (last 8 weeks) ────────────────────
  // Count distinct subs that were active-ish in each week. Cheap + coherent:
  // created_at <= weekStart AND (canceled_at is null OR canceled_at > weekEnd).
  {
    const weeks = [];
    const cursor = startOfWeekUTC(now);
    for (let i = 7; i >= 0; i -= 1) {
      const weekStart = new Date(cursor);
      weekStart.setUTCDate(weekStart.getUTCDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
      let count = 0;
      for (const r of allRows || []) {
        if (r.tier === "free") continue;
        if (!r.created_at) continue;
        if (new Date(r.created_at) > weekEnd) continue;
        if (r.canceled_at && new Date(r.canceled_at) <= weekStart) continue;
        count += 1;
      }
      weeks.push({ weekStart: weekStart.toISOString(), count });
    }
    totals.paidMembersWeekly = weeks;
  }

  // ─── 5. Dunning queue — every grace_period sub with retry context ───────
  const graceSubs = (allRows || []).filter((r) => r.status === "grace_period");
  let dunning = [];
  if (graceSubs.length > 0) {
    const graceIds = graceSubs.map((r) => r.id);
    const { data: recentFails } = await supabase
      .from("membership_payment_events")
      .select("subscription_id, action_code, message, amount, currency, created_at")
      .in("subscription_id", graceIds)
      .in("event_type", ["renewal_failed"])
      .order("created_at", { ascending: false });

    const { data: detailRows } = await supabase
      .from("membership_subscriptions")
      .select("id, member_name, member_email, tier, price_amount, currency, next_billing_date, current_period_end")
      .in("id", graceIds);

    const byId = new Map((detailRows || []).map((r) => [r.id, r]));
    const failsById = new Map();
    for (const ev of recentFails || []) {
      const list = failsById.get(ev.subscription_id) || [];
      list.push(ev);
      failsById.set(ev.subscription_id, list);
    }

    dunning = graceSubs.map((g) => {
      const d = byId.get(g.id) || {};
      const fails = failsById.get(g.id) || [];
      const lastFail = fails[0] || null;
      return {
        id:              g.id,
        member_name:     d.member_name,
        member_email:    d.member_email,
        tier:            d.tier,
        price_amount:    d.price_amount,
        currency:        d.currency,
        next_billing_date: d.next_billing_date,
        current_period_end: d.current_period_end,
        last_action_code: lastFail?.action_code || null,
        last_message:    lastFail?.message || null,
        failed_at:       lastFail?.created_at || null,
        attempt_number:  fails.length,
      };
    }).sort((a, b) => {
      const ad = a.next_billing_date ? new Date(a.next_billing_date).getTime() : 0;
      const bd = b.next_billing_date ? new Date(b.next_billing_date).getTime() : 0;
      return ad - bd;
    });
  }

  // ─── 6. Recent activity feed (last 15 events across all subs) ────────────
  const { data: recentEvents } = await supabase
    .from("membership_payment_events")
    .select("id, subscription_id, member_email, event_type, message, amount, currency, action_code, created_at")
    .order("created_at", { ascending: false })
    .limit(15);

  return NextResponse.json({
    memberships: rows || [],
    totals,
    dunning,
    activity: recentEvents || [],
    attention: { endingSoonIds, noCardIds },
    meta: {
      generated_at: now.toISOString(),
      reference: { thirtyDaysAgo: thirtyDaysAgo.toISOString(), sixtyDaysAgo: sixtyDaysAgo.toISOString() },
    },
  });
}
