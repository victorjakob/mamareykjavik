// /api/admin/tribe-cards/lifecycle
// -----------------------------------------------------------------------------
// GET   — funnel overview: expiring soon / expired / notifications sent /
//         converted to paid, plus the last cron runs.
// POST  — { action: "run",    dryRun }              run the daily lifecycle now
//         { action: "invite", dryRun, onlyEmails }  one-off paid-Tribe invite
//                                                    to unlimited-card holders
// Admin session required. dryRun defaults to TRUE — nothing is sent or
// changed unless the caller passes dryRun: false explicitly.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import {
  runTribeCardLifecycle,
  inviteUnlimitedCards,
  WARN_DAYS,
} from "@/lib/tribeCardLifecycle";

export const runtime = "nodejs";
export const maxDuration = 60;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createServerSupabase();
  const now = new Date();
  const soon = new Date(now.getTime() + WARN_DAYS * 86400000).toISOString();

  const [cards, notes, subs, runs] = await Promise.all([
    supabase.from("tribe_cards").select("id, holder_email, holder_name, status, source, expires_at"),
    supabase.from("tribe_card_notifications").select("tribe_card_id, kind, sent_at, sent_to, metadata").order("sent_at", { ascending: false }),
    supabase.from("membership_subscriptions").select("member_email, tier, status, created_at, tribe_card_id").neq("tier", "free"),
    supabase.from("cron_runs").select("id, status, started_at, finished_at, result, error").eq("automation_id", "cron-tribe-card-lifecycle").order("started_at", { ascending: false }).limit(5),
  ]);
  for (const r of [cards, notes, subs]) {
    if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 });
  }

  const all = cards.data || [];
  const nowIso = now.toISOString();
  const paidEmails = new Set((subs.data || []).filter((s) => ["active", "grace_period", "past_due"].includes(s.status)).map((s) => s.member_email?.toLowerCase()));

  const notified = new Set((notes.data || []).map((n) => n.tribe_card_id));
  // "Converted" = card got a lifecycle email and its holder now has a paid sub.
  const converted = all.filter((c) => notified.has(c.id) && paidEmails.has(c.holder_email?.toLowerCase()));

  return NextResponse.json({
    now: nowIso,
    counts: {
      total: all.length,
      unlimited: all.filter((c) => c.status === "active" && !c.expires_at).length,
      expiringSoon: all.filter((c) => c.status === "active" && c.expires_at && c.expires_at > nowIso && c.expires_at <= soon).length,
      overdueNotFlipped: all.filter((c) => c.status === "active" && c.expires_at && c.expires_at <= nowIso).length,
      expired: all.filter((c) => c.status === "expired").length,
      paidMembers: paidEmails.size,
      converted: converted.length,
      notifications: {
        expiring_30d: (notes.data || []).filter((n) => n.kind === "expiring_30d").length,
        expired: (notes.data || []).filter((n) => n.kind === "expired").length,
        expired_followup: (notes.data || []).filter((n) => n.kind === "expired_followup").length,
        tribe_invite: (notes.data || []).filter((n) => n.kind === "tribe_invite").length,
      },
    },
    recentNotifications: (notes.data || []).slice(0, 50),
    recentRuns: runs.data || [],
  });
}

export async function POST(req) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const dryRun = body.dryRun !== false; // default true
  const supabase = createServerSupabase();

  try {
    if (body.action === "run") {
      const report = await runTribeCardLifecycle(supabase, { dryRun });
      return NextResponse.json(report);
    }
    // One-off after a pass redesign: ping every device holding an active
    // card so Apple / Google re-fetch the pass with the new artwork.
    if (body.action === "refresh-passes") {
      const { pushTribeCardUpdate } = await import("@/lib/walletApns");
      const { updateGoogleWalletObject } = await import("@/lib/googleWallet");
      const { data: cards } = await supabase.from("tribe_cards").select("*").eq("status", "active");
      const report = { dryRun, total: (cards || []).length, pushed: 0, errors: [] };
      for (const card of cards || []) {
        if (dryRun) continue;
        try {
          await Promise.allSettled([pushTribeCardUpdate(supabase, card.id), updateGoogleWalletObject(card)]);
          report.pushed += 1;
        } catch (err) {
          report.errors.push({ id: card.id, error: err?.message || String(err) });
        }
      }
      return NextResponse.json(report);
    }
    if (body.action === "invite") {
      const report = await inviteUnlimitedCards(supabase, {
        dryRun,
        onlyEmails: Array.isArray(body.onlyEmails) ? body.onlyEmails : null,
      });
      return NextResponse.json(report);
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[admin tribe lifecycle]", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}
