// Tribe-card lifecycle — the daily housekeeping for gifted / legacy cards.
// -----------------------------------------------------------------------------
// Paid Tribe cards are extended / expired by the membership renewal flow
// (membershipRenew.js). Every OTHER card — legacy, friends-family, gift —
// had nothing looking after it: expires_at came and went, the row stayed
// "active", the wallet pass quietly greyed out, and nobody got an email.
//
// runTribeCardLifecycle() does four things, each idempotent:
//   1. expire      active cards past expires_at → status 'expired',
//                  push the wallet update (Apple APNs + Google PATCH),
//                  send the "your card has ended" email.
//   2. warn        active cards expiring within 30 days → "ends soon" email.
//   3. follow up   cards expired 14–90 days ago → one "we miss you" nudge.
//   4. (on demand) invite unlimited cards to the paid Tribe — see
//                  inviteUnlimitedCards(); not run by the cron.
//
// Every email is logged in tribe_card_notifications (unique per card+kind)
// so a re-run never double-sends. Anyone with a live paid membership is
// skipped everywhere — they are already in the Tribe.
//
// Used by /api/cron/tribe-card-lifecycle and the admin tools.

import { pushTribeCardUpdate } from "@/lib/walletApns";
import { updateGoogleWalletObject } from "@/lib/googleWallet";
import {
  sendTribeCardExpiringSoonEmail,
  sendTribeCardExpiredEmail,
  sendTribeCardExpiredFollowUpEmail,
  sendTribeCardInviteEmail,
} from "@/lib/tribeCardLifecycleEmails";

const CARD_FIELDS =
  "id, access_token, holder_email, holder_name, discount_percent, duration_type, issued_at, expires_at, status, source";

const DAY_MS = 24 * 60 * 60 * 1000;
export const WARN_DAYS = 30;
// Don't send "ends soon" to a card that was only just issued — a 1-month
// gift card would otherwise get the warning on the same day as its welcome.
export const WARN_MIN_AGE_DAYS = 14;
export const FOLLOWUP_AFTER_DAYS = 14;
export const FOLLOWUP_WINDOW_DAYS = 90;

const LIVE_SUB_STATUSES = ["active", "grace_period", "past_due", "pending_payment"];

// Emails + card ids that currently have a paid membership row we should
// not interfere with.
async function loadLiveMembers(supabase) {
  const { data, error } = await supabase
    .from("membership_subscriptions")
    .select("member_email, tribe_card_id, tier, status")
    .in("status", LIVE_SUB_STATUSES);
  if (error) throw new Error(`membership_subscriptions: ${error.message}`);
  const emails = new Set();
  const cardIds = new Set();
  for (const row of data || []) {
    // The free tier is just a hello — it doesn't own a card.
    if (row.tier === "free") continue;
    if (row.member_email) emails.add(String(row.member_email).toLowerCase());
    if (row.tribe_card_id) cardIds.add(row.tribe_card_id);
  }
  return { emails, cardIds };
}

function isLiveMember(card, live) {
  return (
    live.cardIds.has(card.id) ||
    live.emails.has(String(card.holder_email || "").toLowerCase())
  );
}

async function loadSentKinds(supabase, cardIds) {
  const sent = new Map(); // cardId → Set(kind)
  if (!cardIds.length) return sent;
  const { data, error } = await supabase
    .from("tribe_card_notifications")
    .select("tribe_card_id, kind")
    .in("tribe_card_id", cardIds);
  if (error) throw new Error(`tribe_card_notifications: ${error.message}`);
  for (const row of data || []) {
    if (!sent.has(row.tribe_card_id)) sent.set(row.tribe_card_id, new Set());
    sent.get(row.tribe_card_id).add(row.kind);
  }
  return sent;
}

async function logNotification(supabase, card, kind, result) {
  // Log skipped sends too (no RESEND key locally) so dry environments
  // don't loop; log failures with metadata so an admin can see them.
  const { error } = await supabase.from("tribe_card_notifications").insert({
    tribe_card_id: card.id,
    kind,
    sent_to: card.holder_email,
    provider_id: result?.id || null,
    metadata: result?.ok
      ? {}
      : { skipped: !!result?.skipped, error: result?.error || null },
  });
  if (error && error.code !== "23505") {
    console.error("[tribeCardLifecycle] log failed", kind, card.id, error.message);
  }
}

async function pushWallets(supabase, card) {
  await Promise.allSettled([
    pushTribeCardUpdate(supabase, card.id),
    updateGoogleWalletObject(card),
  ]).then((rs) =>
    rs.forEach((r) => {
      if (r.status === "rejected") {
        console.error("[tribeCardLifecycle] wallet push failed", card.id, r.reason?.message || r.reason);
      }
    }),
  );
}

/**
 * Run the daily lifecycle pass.
 * @param {object} supabase  service-role client
 * @param {object} [opts]
 * @param {Date}   [opts.now]
 * @param {boolean}[opts.dryRun]  report what WOULD happen, change nothing
 */
export async function runTribeCardLifecycle(supabase, { now = new Date(), dryRun = false } = {}) {
  const live = await loadLiveMembers(supabase);
  const nowIso = now.toISOString();
  const warnUntilIso = new Date(now.getTime() + WARN_DAYS * DAY_MS).toISOString();
  const warnIssuedBeforeIso = new Date(now.getTime() - WARN_MIN_AGE_DAYS * DAY_MS).toISOString();
  const followupBeforeIso = new Date(now.getTime() - FOLLOWUP_AFTER_DAYS * DAY_MS).toISOString();
  const followupAfterIso = new Date(now.getTime() - FOLLOWUP_WINDOW_DAYS * DAY_MS).toISOString();

  const [toExpire, toWarn, toFollowUp] = await Promise.all([
    supabase.from("tribe_cards").select(CARD_FIELDS)
      .eq("status", "active").not("expires_at", "is", null).lte("expires_at", nowIso),
    supabase.from("tribe_cards").select(CARD_FIELDS)
      .eq("status", "active").gt("expires_at", nowIso).lte("expires_at", warnUntilIso)
      .lte("issued_at", warnIssuedBeforeIso),
    supabase.from("tribe_cards").select(CARD_FIELDS)
      .eq("status", "expired").lte("expires_at", followupBeforeIso).gte("expires_at", followupAfterIso),
  ]);
  for (const r of [toExpire, toWarn, toFollowUp]) {
    if (r.error) throw new Error(`tribe_cards: ${r.error.message}`);
  }

  const allIds = [...(toExpire.data || []), ...(toWarn.data || []), ...(toFollowUp.data || [])].map((c) => c.id);
  const sent = await loadSentKinds(supabase, allIds);
  const hasSent = (card, kind) => sent.get(card.id)?.has(kind);

  const report = { dryRun, now: nowIso, expired: [], warned: [], followedUp: [], skippedLiveMember: [] };

  // 1. Expire ----------------------------------------------------------------
  for (const card of toExpire.data || []) {
    if (isLiveMember(card, live)) { report.skippedLiveMember.push(card.id); continue; }
    const entry = { id: card.id, email: card.holder_email, expires_at: card.expires_at };
    if (!dryRun) {
      const { error } = await supabase.from("tribe_cards").update({ status: "expired" }).eq("id", card.id);
      if (error) { entry.error = error.message; report.expired.push(entry); continue; }
      const expiredCard = { ...card, status: "expired" };
      await pushWallets(supabase, expiredCard);
      if (!hasSent(card, "expired")) {
        const res = await sendTribeCardExpiredEmail(expiredCard);
        await logNotification(supabase, card, "expired", res);
        entry.email_sent = !!res?.ok;
      }
    }
    report.expired.push(entry);
  }

  // 2. Warn ------------------------------------------------------------------
  for (const card of toWarn.data || []) {
    if (isLiveMember(card, live)) { report.skippedLiveMember.push(card.id); continue; }
    if (hasSent(card, "expiring_30d")) continue;
    const entry = { id: card.id, email: card.holder_email, expires_at: card.expires_at };
    if (!dryRun) {
      const res = await sendTribeCardExpiringSoonEmail(card);
      await logNotification(supabase, card, "expiring_30d", res);
      entry.email_sent = !!res?.ok;
    }
    report.warned.push(entry);
  }

  // 3. Follow up -------------------------------------------------------------
  for (const card of toFollowUp.data || []) {
    if (isLiveMember(card, live)) { report.skippedLiveMember.push(card.id); continue; }
    if (hasSent(card, "expired_followup")) continue;
    const entry = { id: card.id, email: card.holder_email, expires_at: card.expires_at };
    if (!dryRun) {
      const res = await sendTribeCardExpiredFollowUpEmail(card);
      await logNotification(supabase, card, "expired_followup", res);
      entry.email_sent = !!res?.ok;
    }
    report.followedUp.push(entry);
  }

  return report;
}

/**
 * One-off: invite holders of unlimited (never-expiring) cards to join the
 * paid Tribe. Never sent twice to the same card; live paid members skipped.
 * Triggered from the admin UI, not the cron.
 */
export async function inviteUnlimitedCards(supabase, { dryRun = true, limit = 500, onlyEmails = null } = {}) {
  const live = await loadLiveMembers(supabase);
  let q = supabase.from("tribe_cards").select(CARD_FIELDS)
    .eq("status", "active").is("expires_at", null).limit(limit);
  if (Array.isArray(onlyEmails) && onlyEmails.length) {
    q = q.in("holder_email", onlyEmails.map((e) => String(e).trim().toLowerCase()));
  }
  const { data: cards, error } = await q;
  if (error) throw new Error(`tribe_cards: ${error.message}`);

  const sent = await loadSentKinds(supabase, (cards || []).map((c) => c.id));
  const report = { dryRun, invited: [], alreadyInvited: [], skippedLiveMember: [] };

  for (const card of cards || []) {
    if (isLiveMember(card, live)) { report.skippedLiveMember.push(card.holder_email); continue; }
    if (sent.get(card.id)?.has("tribe_invite")) { report.alreadyInvited.push(card.holder_email); continue; }
    const entry = { id: card.id, email: card.holder_email, name: card.holder_name };
    if (!dryRun) {
      const res = await sendTribeCardInviteEmail(card);
      await logNotification(supabase, card, "tribe_invite", res);
      entry.email_sent = !!res?.ok;
      if (res?.error) entry.error = res.error;
    }
    report.invited.push(entry);
  }
  return report;
}
