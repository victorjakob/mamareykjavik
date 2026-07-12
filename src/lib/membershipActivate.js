// Shared activation tail for the RPG subscription signup flow.
// -----------------------------------------------------------------------------
// Called by both /api/membership/rpg-signup (frictionless 3DS path) and
// /api/membership/rpg-verify (post-challenge completion). Keeping this logic
// in one place means "successful first CIT charge → live subscription" is
// computed identically regardless of whether the challenge was invoked.
//
// Input:
//   supabase, email, userId, fullName, tier, amount, orderId,
//   multiToken, charge, last4, brand, language, subscriptionId
//
// Side effects:
//   - DELETE + INSERT on membership_payment_methods for (subscriptionId, default).
//   - UPDATE membership_subscriptions → active, sets period + next_billing_date,
//     clears metadata.threeds + cancel_at_period_end.
//   - Calls mergeTribeCardExtension + issues/extends tribe_cards row.
//   - Audits initial_charge_succeeded (idempotent on order_id).
//   - Sends the welcome + first-receipt emails (and the tribe card welcome for
//     newly issued cards) — first invocation per order only, best effort.
//
// Returns:
//   { ok: true, nextBillingDate: <ISO>, tribeCardId?: <uuid> }

import { addOneMonth, mergeTribeCardExtension, isCardValidNow, redactTeyaPayload } from "@/lib/membershipTeya";
import { addToList } from "@/lib/subscribers";
import { sendWelcomeTribeEmail, sendFirstReceiptEmail } from "@/lib/membershipEmails";
import { sendTribeWelcomeEmail } from "@/lib/sendTribeWelcomeEmail";
import { pushTribeCardUpdate } from "@/lib/walletApns";
import { updateGoogleWalletObject } from "@/lib/googleWallet";

const DEFAULT_DISCOUNTS = {
  tribe:  20,
  patron: 25,
};

export async function activateSubscriptionFromCharge({
  supabase,
  email,
  userId,
  fullName,
  tier,
  amount,
  orderId,
  multiToken,
  charge,
  last4,
  brand,
  language,          // informational — could drive locale-specific emails later
  subscriptionId,
}) {
  // Prefer the last4/brand that came back from Teya's payment response; only
  // fall back to the hints the browser passed us.
  const finalLast4 = charge?.raw?.panLast4 || last4 || null;
  const finalBrand = charge?.raw?.cardType || brand || null;

  // One default card per subscription.
  await supabase.from("membership_payment_methods")
    .delete()
    .eq("subscription_id", subscriptionId)
    .eq("is_default", true);
  await supabase.from("membership_payment_methods").insert({
    subscription_id:        subscriptionId,
    member_email:           email,
    provider:               "teya",
    virtual_card_number:    null,                       // RPG flow uses multi-token only
    rpg_multi_token:        multiToken,
    card_expiration:        null,                       // not returned on CIT payload
    card_last4:             finalLast4,
    card_brand:             finalBrand,
    initial_transaction_id: charge?.transactionId || null,
    is_default:             true,
  });

  const now       = new Date();
  const periodEnd = addOneMonth(now);

  // Clear threeds challenge state + activate.
  const { data: existingSub } = await supabase
    .from("membership_subscriptions")
    .select("metadata")
    .eq("id", subscriptionId)
    .maybeSingle();
  const cleanMetadata = { ...(existingSub?.metadata || {}) };
  delete cleanMetadata.threeds;
  cleanMetadata.last_activated_at = now.toISOString();
  if (language) cleanMetadata.language = language;

  await supabase.from("membership_subscriptions").update({
    status:               "active",
    current_period_start: now.toISOString(),
    current_period_end:   periodEnd.toISOString(),
    next_billing_date:    periodEnd.toISOString(),
    cancel_at_period_end: false,
    canceled_at:          null,
    paused_at:            null,
    metadata:             cleanMetadata,
  }).eq("id", subscriptionId);

  // ─── Issue or extend the tribe card ────────────────────────────────────
  const discountPercent = DEFAULT_DISCOUNTS[tier] || 15;

  const { data: existingCard, error: existingCardErr } = await supabase
    .from("tribe_cards")
    .select("id, status, source, discount_percent, duration_type, expires_at, holder_name, user_id, previous_state")
    .eq("holder_email", email)
    .maybeSingle();
  if (existingCardErr) {
    console.error("activate tribe_cards lookup error:", existingCardErr);
  }

  const nextCardDefaults = {
    discount_percent: discountPercent,
    duration_type:    "month",
    expires_at:       periodEnd.toISOString(),
    source:           "paid-tribe",
    user_id:          userId,
    holder_name:      fullName || null,
  };

  // Snapshot validity BEFORE the merge so we can tell a revival (lapsed /
  // expired / revoked card coming back to active) apart from a plain
  // extension of a still-working card.
  const cardWasValidBefore = isCardValidNow(existingCard);

  const mergeResult = mergeTribeCardExtension(existingCard, nextCardDefaults, { operation: "upgrade" });

  let resolvedCardId  = existingCard?.id || null;
  let cardWasIssued   = false; // true only when a brand-new card row is created
  let cardWasRevived  = false; // true when an invalid existing card went back to active

  if (mergeResult.type === "upgrade") {
    const { error: updErr } = await supabase
      .from("tribe_cards")
      .update(mergeResult.update)
      .eq("id", existingCard.id);
    if (updErr) console.error("activate tribe_cards upgrade error:", updErr, mergeResult.update);
    if (!updErr) {
      cardWasRevived = !cardWasValidBefore && mergeResult.update.status === "active";

      // The member's pass is already installed on their devices — push the
      // upgraded / revived state to both wallets so it updates silently.
      // Best-effort; logged but never fails the activation.
      pushTribeCardUpdate(supabase, existingCard.id).catch((err) =>
        console.error("[membershipActivate] Apple wallet push failed:", err?.message || err),
      );
      (async () => {
        const { data: latestCard } = await supabase
          .from("tribe_cards")
          .select("*")
          .eq("id", existingCard.id)
          .maybeSingle();
        if (latestCard) {
          await updateGoogleWalletObject(latestCard);
        }
      })().catch((err) =>
        console.error("[membershipActivate] Google wallet update failed:", err?.message || err),
      );
    }
  } else if (mergeResult.type === "insert") {
    const insertCard = {
      ...mergeResult.update,
      holder_email: email,
      holder_name:  mergeResult.update.holder_name || email.split("@")[0],
    };
    const { data: newCard, error: newCardErr } = await supabase
      .from("tribe_cards")
      .insert(insertCard)
      .select("id")
      .single();
    if (newCardErr) console.error("activate tribe_cards insert error:", newCardErr, insertCard);
    if (newCard?.id) {
      resolvedCardId = newCard.id;
      cardWasIssued  = true;
    }
  }

  if (resolvedCardId) {
    await supabase.from("membership_subscriptions")
      .update({ tribe_card_id: resolvedCardId })
      .eq("id", subscriptionId);
  }

  // ─── Audit success (idempotent) ────────────────────────────────────────
  // Check whether this exact charge was already recorded — activation can be
  // invoked twice for the same order (e.g. a retried verify callback). The
  // welcome/receipt sends below key off this flag so a replay never
  // double-emails the member.
  const { data: priorEvent } = await supabase
    .from("membership_payment_events")
    .select("id")
    .eq("subscription_id", subscriptionId)
    .eq("event_type", "initial_charge_succeeded")
    .eq("order_id", orderId)
    .maybeSingle();
  const alreadyRecorded = !!priorEvent;

  const { error: eventErr } = await supabase.from("membership_payment_events").insert({
    subscription_id: subscriptionId,
    member_email:    email,
    event_type:      "initial_charge_succeeded",
    order_id:        orderId,
    transaction_id:  charge?.transactionId || null,
    amount,
    currency:        "ISK",
    raw:             redactTeyaPayload({ ...(charge?.raw || {}), flow: "rpg_direct" }),
  });
  if (eventErr && !String(eventErr.message || "").toLowerCase().includes("duplicate")) {
    console.error("activate events insert error:", eventErr);
  }

  // ─── Newsletter capture (new paid member) ──────────────────────────────
  // Members join the subscriber list automatically. Best effort — never let a
  // list/Resend hiccup fail an activation.
  try {
    await addToList({ email, name: fullName, source: "member", supabase });
  } catch (err) {
    console.error("[membershipActivate] addToList failed:", err?.message || err);
  }

  // ─── Welcome + first-receipt emails ────────────────────────────────────
  // Skipped when this order was already recorded (replayed activation).
  // Every send is best effort — a Resend failure never fails the charge.
  if (!alreadyRecorded) {
    try {
      await sendWelcomeTribeEmail({ to: email, name: fullName });
    } catch (err) {
      console.error("[membershipActivate] welcome email failed:", err?.message || err);
    }

    try {
      await sendFirstReceiptEmail({
        to:              email,
        name:            fullName,
        amount,
        currency:        "ISK",
        nextBillingDate: periodEnd.toISOString(),
        tier,
        transactionId:   charge?.transactionId || null,
      });
    } catch (err) {
      console.error("[membershipActivate] first receipt email failed:", err?.message || err);
    }

    // Tribe card welcome (card link + wallet passes) — for freshly issued
    // cards AND revived ones (a lapsed/expired/revoked card brought back to
    // active by a re-subscribe: their old pass may be voided or deleted, so
    // they need the link + wallet buttons again). Members whose still-valid
    // card was merely extended already hold a working pass — the wallet push
    // above updates it silently, no email.
    if ((cardWasIssued || cardWasRevived) && resolvedCardId) {
      try {
        const { data: cardRow } = await supabase
          .from("tribe_cards")
          .select("*")
          .eq("id", resolvedCardId)
          .maybeSingle();
        if (cardRow?.access_token) {
          await sendTribeWelcomeEmail(cardRow);
        }
      } catch (err) {
        console.error("[membershipActivate] tribe card welcome failed:", err?.message || err);
      }
    }
  }

  return {
    ok: true,
    nextBillingDate: periodEnd.toISOString(),
    tribeCardId:     resolvedCardId,
  };
}
