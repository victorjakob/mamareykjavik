// Subscriber master-list engine.
// ───────────────────────────────
// One place that knows how to:
//   - gather every distinct email the business holds (across tickets, accounts,
//     tribe cards, members, meal/gift cards, …) with its source + consent hint,
//   - consolidate those into public.newsletter_subscribers (the single source of
//     truth, mirrored to Resend), honouring anyone who has opted out,
//   - push un-synced subscribers to the Resend audience in safe batches,
//   - mark an address unsubscribed everywhere at once (master + audit + Resend).
//
// All reads/writes use the service-role server client, so this module is
// server-only. Resend calls are wrapped so a flaky API never corrupts state.

import "server-only";
import { createServerSupabase } from "@/util/supabase/server";
import { createResend } from "@/lib/resend";

// Human labels for every source we attribute an email to. Used by the dashboard.
export const SOURCE_LABELS = {
  account: "Account sign-ups",
  ticket_buyer: "Ticket buyers",
  tribe_card: "Tribe card holders",
  tribe_request: "Tribe card requests",
  member: "Paid members",
  meal_card: "Meal card buyers",
  gift_card: "Gift card buyers",
  resend_import: "Imported list",
  manual: "Added by hand",
};

// Where to look for emails, and which columns hold the email / name / date /
// explicit-opt-in flag on each table.
const BUSINESS_POOLS = [
  { src: "account", table: "users", email: "email", name: "name", created: "created_at", optin: "email_subscription" },
  { src: "ticket_buyer", table: "tickets", email: "buyer_email", name: "buyer_name", created: "created_at", optin: "subscribe_to_newsletter" },
  { src: "tribe_card", table: "tribe_cards", email: "holder_email", name: "holder_name", created: "created_at" },
  { src: "tribe_request", table: "tribe_card_requests", email: "email", name: "name", created: "created_at" },
  { src: "member", table: "membership_subscriptions", email: "member_email", name: "member_name", created: "created_at" },
  { src: "meal_card", table: "meal_cards", email: "buyer_email", name: "buyer_name", created: "created_at" },
  { src: "gift_card", table: "gift_cards", email: "buyer_email", name: "buyer_name", created: "created_at" },
];

const PAGE = 1000; // Supabase hard row cap per request.

export function normaliseEmail(raw) {
  return (raw || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return (
    typeof email === "string" &&
    email.length >= 3 &&
    email.length <= 320 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function splitName(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") };
}

// Read every row of a table/column set, paging past the 1000-row cap.
async function selectAll(db, table, columns, orderCol) {
  const out = [];
  let from = 0;
  for (;;) {
    let q = db.from(table).select(columns).range(from, from + PAGE - 1);
    if (orderCol) q = q.order(orderCol, { ascending: true, nullsFirst: false });
    const { data, error } = await q;
    if (error) {
      console.error(`[subscribers] read ${table} failed:`, error.message || error);
      break;
    }
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return out;
}

/**
 * Build a Map<email, { email, name, sources:Set<string>, first_source,
 * last_seen, explicit_optin }> of every distinct business email.
 */
export async function gatherBusinessEmails(supabase) {
  const db = supabase || createServerSupabase();
  const map = new Map();

  for (const pool of BUSINESS_POOLS) {
    const cols = [pool.email, pool.name, pool.created, pool.optin]
      .filter(Boolean)
      .join(",");
    const rows = await selectAll(db, pool.table, cols, pool.created);
    for (const row of rows) {
      const email = normaliseEmail(row[pool.email]);
      if (!isValidEmail(email)) continue;
      const created = row[pool.created]
        ? new Date(row[pool.created]).toISOString()
        : null;
      const optin = pool.optin ? row[pool.optin] === true : false;

      let entry = map.get(email);
      if (!entry) {
        entry = {
          email,
          name: null,
          sources: new Set(),
          first_source: pool.src,
          last_seen: created,
          explicit_optin: false,
        };
        map.set(email, entry);
      }
      entry.sources.add(pool.src);
      const nm = pool.name ? (row[pool.name] || "").toString().trim() : "";
      if (!entry.name && nm) entry.name = nm;
      if (optin) entry.explicit_optin = true;
      if (created && (!entry.last_seen || created > entry.last_seen)) {
        entry.last_seen = created;
      }
    }
  }
  return map;
}

// Every audience id in the Resend account. Crucial: the manual broadcasts may
// have been sent to a different audience than RESEND_AUDIENCE_ID, so opt-outs
// can live anywhere. Falls back to the env audience if listing fails.
async function listResendAudienceIds(resend) {
  const ids = [];
  try {
    const res = await resend.audiences.list();
    const arr = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
    for (const a of arr) if (a?.id) ids.push(a.id);
  } catch (err) {
    console.error("[subscribers] audiences.list failed", err?.message || err);
  }
  if (!ids.length && process.env.RESEND_AUDIENCE_ID) {
    ids.push(process.env.RESEND_AUDIENCE_ID);
  }
  return ids;
}

// Everyone Resend shows as unsubscribed, across ALL audiences — including
// people who opted out of the manual broadcasts sent straight from Resend.
async function gatherResendUnsubscribed() {
  const resend = createResend();
  const set = new Set();
  const ids = await listResendAudienceIds(resend);
  for (const audienceId of ids) {
    try {
      const res = await resend.contacts.list({ audienceId });
      for (const c of resendContactsArray(res)) {
        if (c?.unsubscribed === true) set.add(normaliseEmail(c.email));
      }
    } catch (err) {
      console.error("[subscribers] contacts.list failed for", audienceId, err?.message || err);
    }
  }
  return set;
}

// The Resend SDK has wrapped its list response differently across versions —
// normalise to a plain array of contacts.
function resendContactsArray(res) {
  const payload = res?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(res)) return res;
  return [];
}

// Emails we already know have opted out — from the welcome ledger and the
// unsubscribe audit log. These must never be flipped back to subscribed.
async function gatherKnownUnsubscribed(db) {
  const out = new Set();
  try {
    const { data } = await db
      .from("newsletter_welcomes")
      .select("email, unsubscribed_at")
      .not("unsubscribed_at", "is", null);
    for (const r of data || []) out.add(normaliseEmail(r.email));
  } catch (err) {
    console.error("[subscribers] welcomes unsub read failed", err?.message || err);
  }
  try {
    const { data } = await db.from("email_unsubscribes").select("email");
    for (const r of data || []) {
      if (r.email) out.add(normaliseEmail(r.email));
    }
  } catch (err) {
    console.error("[subscribers] unsub log read failed", err?.message || err);
  }
  return out;
}

/**
 * Consolidate all business emails into newsletter_subscribers.
 *
 * @param {object} opts
 * @param {boolean} [opts.commit=false]  - false = dry run (counts only).
 * @returns summary counts + per-source breakdown.
 */
export async function consolidateSubscribers({ commit = false } = {}) {
  const db = createServerSupabase();

  const [business, existingRows, optedOut, resendUnsub] = await Promise.all([
    gatherBusinessEmails(db),
    selectAll(db, "newsletter_subscribers", "email,status,sources", "email"),
    gatherKnownUnsubscribed(db),
    gatherResendUnsubscribed(),
  ]);

  // Fold Resend's opt-outs into the local set — this is what makes "Add
  // everyone" skip people who unsubscribed from the manual broadcasts.
  for (const e of resendUnsub) optedOut.add(e);

  const existing = new Map();
  for (const r of existingRows) existing.set(normaliseEmail(r.email), r);

  const bySource = {};
  let toAdd = 0;
  let toUpdate = 0;
  let skippedUnsub = 0;
  const upserts = [];
  const nowIso = new Date().toISOString();

  for (const entry of business.values()) {
    for (const s of entry.sources) bySource[s] = (bySource[s] || 0) + 1;

    const prior = existing.get(entry.email);
    const isOptedOut = optedOut.has(entry.email) || prior?.status === "unsubscribed";

    if (isOptedOut) {
      skippedUnsub += 1;
      // Make sure the master row reflects the opt-out, but never re-subscribe.
      upserts.push({
        email: entry.email,
        name: entry.name,
        status: "unsubscribed",
        unsubscribed_at: prior?.unsubscribed_at || nowIso,
        first_source: prior?.first_source || entry.first_source,
        sources: mergeSources(prior?.sources, entry.sources),
        last_seen_at: entry.last_seen,
        updated_at: nowIso,
      });
      continue;
    }

    if (prior) toUpdate += 1;
    else toAdd += 1;

    upserts.push({
      email: entry.email,
      name: entry.name,
      status: "subscribed",
      consent_basis: entry.explicit_optin ? "explicit_optin" : "soft_optin_customer",
      first_source: prior?.first_source || entry.first_source,
      sources: mergeSources(prior?.sources, entry.sources),
      last_seen_at: entry.last_seen,
      subscribed_at: prior ? undefined : (entry.last_seen || nowIso),
      updated_at: nowIso,
    });
  }

  if (commit && upserts.length) {
    // Upsert in chunks so we stay well under any payload limits.
    const CHUNK = 500;
    for (let i = 0; i < upserts.length; i += CHUNK) {
      const slice = upserts.slice(i, i + CHUNK).map((r) => {
        const clean = { ...r };
        if (clean.subscribed_at === undefined) delete clean.subscribed_at;
        return clean;
      });
      const { error } = await db
        .from("newsletter_subscribers")
        .upsert(slice, { onConflict: "email" });
      if (error) {
        return {
          ok: false,
          error: error.message,
          committed: i,
        };
      }
    }
  }

  return {
    ok: true,
    committed: commit,
    business_total: business.size,
    master_before: existing.size,
    to_add: toAdd,
    to_update: toUpdate,
    skipped_unsubscribed: skippedUnsub,
    by_source: bySource,
  };
}

function mergeSources(prior, set) {
  const merged = new Set(Array.isArray(prior) ? prior : []);
  for (const s of set || []) merged.add(s);
  return Array.from(merged);
}

/**
 * Import the current Resend audience into the master list: brings in the
 * contacts you uploaded by hand AND, crucially, marks everyone who already
 * unsubscribed (from the manual broadcasts) as unsubscribed here too — so a
 * later "Add everyone" skips them and they never get re-added.
 *
 * A local opt-out always wins: someone unsubscribed on our side stays
 * unsubscribed even if Resend still shows them subscribed.
 *
 * @param {object} opts
 * @param {boolean} [opts.commit=false]
 */
export async function importFromResend({ commit = false } = {}) {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    return { ok: false, error: "RESEND_AUDIENCE_ID is not configured" };
  }
  const db = createServerSupabase();
  const resend = createResend();

  let contacts;
  try {
    const res = await resend.contacts.list({ audienceId });
    if (res?.error) {
      return { ok: false, error: res.error?.message || "Resend list failed" };
    }
    contacts = resendContactsArray(res);
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }

  // Local opt-outs that must stick regardless of Resend state.
  const { data: existingRows } = await db
    .from("newsletter_subscribers")
    .select("email, status");
  const localUnsub = new Set(
    (existingRows || [])
      .filter((r) => r.status === "unsubscribed")
      .map((r) => normaliseEmail(r.email)),
  );

  const nowIso = new Date().toISOString();
  const rows = [];
  const audit = [];
  let subscribed = 0;
  let unsubscribed = 0;

  for (const c of contacts) {
    const email = normaliseEmail(c.email);
    if (!isValidEmail(email)) continue;
    const isUnsub = c.unsubscribed === true || localUnsub.has(email);
    const name = [c.first_name, c.last_name].filter(Boolean).join(" ").trim() || null;
    if (isUnsub) unsubscribed += 1;
    else subscribed += 1;

    rows.push({
      email,
      name,
      status: isUnsub ? "unsubscribed" : "subscribed",
      consent_basis: "imported",
      first_source: "resend_import",
      sources: ["resend_import"],
      resend_contact_id: c.id || null,
      resend_synced_at: nowIso, // already in Resend — no push needed
      subscribed_at: isUnsub
        ? undefined
        : c.created_at
          ? new Date(c.created_at).toISOString()
          : nowIso,
      unsubscribed_at: isUnsub ? nowIso : undefined,
      updated_at: nowIso,
    });
    if (isUnsub) audit.push({ email, source: "resend_import" });
  }

  if (commit && rows.length) {
    const CHUNK = 500;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const slice = rows.slice(i, i + CHUNK).map((r) => {
        const clean = { ...r };
        if (clean.subscribed_at === undefined) delete clean.subscribed_at;
        if (clean.unsubscribed_at === undefined) delete clean.unsubscribed_at;
        return clean;
      });
      const { error } = await db
        .from("newsletter_subscribers")
        .upsert(slice, { onConflict: "email" });
      if (error) return { ok: false, error: error.message, committed: i };
    }
    if (audit.length) {
      try {
        await db.from("email_unsubscribes").upsert(audit, { onConflict: "email" });
      } catch (err) {
        console.error("[subscribers] resend-import audit failed", err?.message || err);
      }
    }
  }

  return {
    ok: true,
    committed: commit,
    total: rows.length,
    subscribed,
    unsubscribed,
  };
}

/**
 * Add a single contact to the list (no welcome email) and sync to Resend.
 * Used by ticket purchase + membership activation so every customer flows
 * straight onto the list. Never resurrects someone who has unsubscribed.
 *
 * @param {object} opts
 * @param {string} opts.email
 * @param {string} [opts.name]
 * @param {string} [opts.source]         e.g. "ticket_buyer", "member"
 * @param {string} [opts.consentBasis]
 * @param {object} [opts.supabase]       reuse a caller's client if handy
 */
export async function addToList({
  email,
  name = null,
  source = "manual",
  consentBasis = "soft_optin_customer",
  supabase = null,
} = {}) {
  const normalised = normaliseEmail(email);
  if (!isValidEmail(normalised)) return { ok: false, reason: "invalid_email" };
  const db = supabase || createServerSupabase();

  let existing = null;
  try {
    const { data } = await db
      .from("newsletter_subscribers")
      .select("status, sources, first_source, name")
      .eq("email", normalised)
      .maybeSingle();
    existing = data || null;
  } catch (err) {
    console.error("[subscribers] addToList lookup", err?.message || err);
  }

  // Never re-subscribe someone who opted out.
  if (existing?.status === "unsubscribed") {
    return { ok: true, skipped: "unsubscribed" };
  }

  const nowIso = new Date().toISOString();

  // Push to Resend. `create` is a harmless "already exists" for known contacts
  // and will not resurrect an opt-out on Resend's side either.
  let resendContactId = null;
  let synced = false;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (audienceId) {
    try {
      const { firstName, lastName } = splitName(name);
      const res = await createResend().contacts.create({
        audienceId,
        email: normalised,
        firstName,
        lastName,
        unsubscribed: false,
      });
      if (res?.error) {
        const msg = String(res.error?.message || "");
        if (/already exists|already a member/i.test(msg)) synced = true;
        else console.warn("[subscribers] addToList resend failed:", normalised, msg);
      } else {
        resendContactId = res?.data?.id || null;
        synced = true;
      }
    } catch (err) {
      console.error("[subscribers] addToList resend", err?.message || err);
    }
  }

  const row = {
    email: normalised,
    name: name || existing?.name || null,
    status: "subscribed",
    consent_basis: consentBasis,
    first_source: existing?.first_source || source,
    sources: mergeSources(existing?.sources, [source]),
    updated_at: nowIso,
  };
  if (resendContactId) row.resend_contact_id = resendContactId;
  if (synced) row.resend_synced_at = nowIso;
  if (!existing) row.subscribed_at = nowIso; // don't overwrite an earlier date

  try {
    await db.from("newsletter_subscribers").upsert(row, { onConflict: "email" });
  } catch (err) {
    console.error("[subscribers] addToList upsert", err?.message || err);
    return { ok: false, reason: "upsert_failed" };
  }
  return { ok: true };
}

/**
 * Push subscribers that aren't in Resend yet into the audience, in one batch.
 * Idempotent and resumable: call repeatedly until `remaining` hits 0.
 *
 * @param {object} opts
 * @param {number} [opts.limit=40]
 */
export async function pushBatchToResend({ limit = 40 } = {}) {
  const db = createServerSupabase();
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    return { ok: false, error: "RESEND_AUDIENCE_ID is not configured", processed: 0, remaining: null };
  }

  const { data: batch, error } = await db
    .from("newsletter_subscribers")
    .select("id, email, name")
    .eq("status", "subscribed")
    .is("resend_synced_at", null)
    .limit(limit);

  if (error) return { ok: false, error: error.message, processed: 0, remaining: null };
  if (!batch || batch.length === 0) {
    return { ok: true, processed: 0, remaining: 0, done: true };
  }

  const resend = createResend();
  let processed = 0;

  for (const sub of batch) {
    const { firstName, lastName } = splitName(sub.name);
    let contactId = null;
    try {
      const res = await resend.contacts.create({
        audienceId,
        email: sub.email,
        firstName,
        lastName,
        unsubscribed: false,
      });
      if (res?.error) {
        const msg = String(res.error?.message || "");
        // "already exists" is success; any other error (e.g. a bad
        // RESEND_AUDIENCE_ID → "Audience not found") must NOT be marked synced,
        // so it's retried once the config is fixed.
        if (!/already exists|already a member/i.test(msg)) {
          console.warn("[subscribers] resend create failed:", sub.email, msg);
          continue;
        }
      } else {
        contactId = res?.data?.id || null;
      }
    } catch (err) {
      console.error("[subscribers] resend create threw", sub.email, err?.message || err);
      // Leave resend_synced_at null so the next batch retries this one.
      continue;
    }

    await db
      .from("newsletter_subscribers")
      .update({
        resend_synced_at: new Date().toISOString(),
        resend_contact_id: contactId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sub.id);
    processed += 1;
  }

  const { count: remaining } = await db
    .from("newsletter_subscribers")
    .select("id", { count: "exact", head: true })
    .eq("status", "subscribed")
    .is("resend_synced_at", null);

  return { ok: true, processed, remaining: remaining ?? null, done: (remaining ?? 0) === 0 };
}

/**
 * Mark one email unsubscribed everywhere: master row, audit log, and Resend.
 * Safe to call when the address isn't in the master list yet.
 */
export async function unsubscribeEverywhere({ email, token = null, source = "unsubscribe_page" }) {
  const normalised = normaliseEmail(email);
  const db = createServerSupabase();
  const nowIso = new Date().toISOString();

  // 1. Audit log (idempotent on email).
  try {
    await db
      .from("email_unsubscribes")
      .upsert({ email: normalised || null, token: token || null, source }, { onConflict: "email" });
  } catch (err) {
    console.error("[subscribers] audit upsert failed", err?.message || err);
  }

  if (!isValidEmail(normalised)) {
    // Token-only path we can't resolve to an address — logged, nothing else to do.
    return { ok: true, resolved: false };
  }

  // 2. Master list — flip to unsubscribed (create the row if we've never seen it).
  try {
    await db
      .from("newsletter_subscribers")
      .upsert(
        {
          email: normalised,
          status: "unsubscribed",
          unsubscribed_at: nowIso,
          updated_at: nowIso,
        },
        { onConflict: "email" },
      );
  } catch (err) {
    console.error("[subscribers] master unsub failed", err?.message || err);
  }

  // 3. Mirror to the welcome ledger so future opt-ins also skip.
  try {
    await db
      .from("newsletter_welcomes")
      .update({ unsubscribed_at: nowIso })
      .eq("email", normalised);
  } catch {
    /* best effort */
  }

  // 4. Resend — mark the contact unsubscribed in the audience.
  await resendUnsubscribe(normalised);

  return { ok: true, resolved: true };
}

/**
 * Manually put someone back on the list (admin action): clears the opt-out in
 * the master list, audit log, and welcome ledger, and re-subscribes the Resend
 * contact. The inverse of unsubscribeEverywhere.
 */
export async function resubscribeEverywhere({ email }) {
  const normalised = normaliseEmail(email);
  if (!isValidEmail(normalised)) return { ok: false, reason: "invalid_email" };
  const db = createServerSupabase();
  const nowIso = new Date().toISOString();

  await db.from("newsletter_subscribers").upsert(
    {
      email: normalised,
      status: "subscribed",
      unsubscribed_at: null,
      subscribed_at: nowIso,
      updated_at: nowIso,
    },
    { onConflict: "email" },
  );
  try {
    await db.from("email_unsubscribes").delete().eq("email", normalised);
  } catch (err) {
    console.error("[resubscribe] audit delete", err?.message || err);
  }
  try {
    await db.from("newsletter_welcomes").update({ unsubscribed_at: null }).eq("email", normalised);
  } catch {
    /* best effort */
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (audienceId) {
    const resend = createResend();
    try {
      const res = await resend.contacts.update({ audienceId, email: normalised, unsubscribed: false });
      if (res?.error) throw new Error(res.error?.message);
    } catch {
      try {
        const got = await resend.contacts.get({ audienceId, email: normalised });
        if (got?.data?.id) {
          await resend.contacts.update({ audienceId, id: got.data.id, unsubscribed: false });
        } else {
          await resend.contacts.create({ audienceId, email: normalised, unsubscribed: false });
        }
      } catch (err) {
        console.error("[resubscribe] resend failed", err?.message || err);
      }
    }
  }
  return { ok: true };
}

/**
 * Sweep every opt-out we can find — local records AND every Resend audience —
 * and make sure each one is honoured everywhere: marked unsubscribed in the
 * master list + audit log, and flipped off in the sending audience so
 * broadcasts exclude them. This is what catches people who unsubscribed from
 * the manual broadcasts, even if those went to a different audience.
 *
 * @param {object} opts
 * @param {boolean} [opts.commit=false]
 */
export async function reconcileUnsubscribes({ commit = false } = {}) {
  const db = createServerSupabase();
  const [local, resendUnsub] = await Promise.all([
    gatherKnownUnsubscribed(db),
    gatherResendUnsubscribed(),
  ]);
  const emails = Array.from(new Set([...local, ...resendUnsub])).filter(isValidEmail);

  let markedInResend = 0;
  if (commit && emails.length) {
    const nowIso = new Date().toISOString();

    // Master: force unsubscribed (creates a row if we've never seen them).
    const rows = emails.map((email) => ({
      email,
      status: "unsubscribed",
      unsubscribed_at: nowIso,
      updated_at: nowIso,
    }));
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await db
        .from("newsletter_subscribers")
        .upsert(rows.slice(i, i + 500), { onConflict: "email" });
      if (error) console.error("[reconcile] master upsert", error.message);
    }

    // Audit log.
    const audit = emails.map((email) => ({ email, source: "resend_reconcile" }));
    for (let i = 0; i < audit.length; i += 500) {
      try {
        await db
          .from("email_unsubscribes")
          .upsert(audit.slice(i, i + 500), { onConflict: "email" });
      } catch (err) {
        console.error("[reconcile] audit upsert", err?.message || err);
      }
    }

    // Flip them off in the sending (env) audience so future broadcasts skip
    // them — even if their original opt-out was in another audience.
    for (const email of emails.slice(0, 1000)) {
      await resendUnsubscribe(email);
      markedInResend += 1;
    }
  }

  return { ok: true, found: emails.length, marked_in_resend: markedInResend };
}

// Tell Resend to suppress this contact. Tries update-by-email, falls back to
// looking up the id first. Never throws.
async function resendUnsubscribe(email) {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) return;
  const resend = createResend();
  try {
    const res = await resend.contacts.update({ audienceId, email, unsubscribed: true });
    if (!res?.error) return;
  } catch {
    /* fall through to id-based update */
  }
  try {
    const got = await resend.contacts.get({ audienceId, email });
    const id = got?.data?.id;
    if (id) {
      await resend.contacts.update({ audienceId, id, unsubscribed: true });
    }
  } catch (err) {
    console.error("[subscribers] resend unsubscribe failed", email, err?.message || err);
  }
}
