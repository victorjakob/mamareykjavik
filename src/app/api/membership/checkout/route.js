// POST /api/membership/checkout
// -----------------------------------------------------------------------------
// Body:
//   {
//     tier: "tribe" | "patron",           // "free" is handled by /api/membership/join-free
//     patronAmount?: number,               // integer ISK, required if tier==="patron", 20_000–200_000 (High Ticket)
//     language?: "IS" | "EN"               // optional, defaults to EN
//   }
//
// Auth: must be signed in (NextAuth session).
//
// Side effects:
//   1. Upserts a `pending_payment` row in membership_subscriptions for this email.
//   2. Inserts a "checkout_created" row in membership_payment_events.
//   3. Returns a Teya SecurePay redirect URL with SaveCard=true for tokenisation.
//
// The actual subscription activation happens when Teya POSTs the server-to-server
// callback to /api/membership/saltpay-callback — that's the only source of truth.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import { buildMembershipCheckoutUrl, newOrderId } from "@/lib/membershipTeya";

const TIER_PRICES = {
  tribe:  2000,       // ISK, fixed
  patron: 20000,      // ISK, High Ticket one-time min
};

const PATRON_MAX_ISK = 200_000;

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please sign in to join." }, { status: 401 });
    }
    const email = String(session.user.email).trim().toLowerCase();
    const name  = session.user.name || "";

    const body = await req.json().catch(() => ({}));
    const tier = String(body.tier || "").toLowerCase();
    const language = body.language === "IS" ? "IS" : "EN";

    if (!["tribe", "patron"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
    }

    // Resolve the monthly amount.
    let amount = TIER_PRICES[tier];
    if (tier === "patron") {
      const n = Number(body.patronAmount);
      if (
        !Number.isFinite(n) ||
        n < TIER_PRICES.patron ||
        n > PATRON_MAX_ISK
      ) {
        return NextResponse.json(
          {
            error: `High Ticket is a one-time payment between ${TIER_PRICES.patron.toLocaleString("is-IS")} and ${PATRON_MAX_ISK.toLocaleString("is-IS")} ISK.`,
          },
          { status: 400 },
        );
      }
      // Round to whole ISK — no cents on the wire.
      amount = Math.round(n);
    }

    const supabase = createServerSupabase();

    // Look up user_id (optional; tribe_cards & subscriptions can live with
    // just an email link, but we store user_id when available for joins).
    const { data: userRow } = await supabase
      .from("users")
      .select("id, name")
      .eq("email", email)
      .maybeSingle();
    const userId   = userRow?.id || null;
    const fullName = name || userRow?.name || "";

    // Handle any existing active subscription.
    //   - Active Free row → legitimate upgrade to a paid tier. Mark the free
    //     row as canceled/upgraded and let the new pending_payment row take
    //     over. No money was ever taken for Free, so nothing to prorate.
    //   - Active paid row on a different tier → allow a tier switch. The new
    //     checkout becomes a fresh subscription; we cancel the old one at
    //     period-end so the member keeps benefits until the new card is
    //     charged, then cron finalises the old row. (Effectively "start new,
    //     let the old one lapse.")
    //   - Active paid row on the same tier → real duplicate, block.
    const { data: existingActive } = await supabase
      .from("membership_subscriptions")
      .select("id, status, tier, price_amount, current_period_end")
      .eq("member_email", email)
      .in("status", ["active", "grace_period", "paused"])
      .maybeSingle();

    if (existingActive) {
      const sameTier = existingActive.tier === tier;
      const samePaidAmount =
        sameTier && existingActive.tier !== "free" &&
        Number(existingActive.price_amount) === Number(amount);

      // Genuine duplicate — same paid tier at same amount. Block.
      if (existingActive.tier !== "free" && samePaidAmount) {
        return NextResponse.json(
          {
            error: "You already have an active membership on this tier.",
            subscriptionId: existingActive.id,
            tier: existingActive.tier,
          },
          { status: 409 },
        );
      }

      // Upgrading from Free → any paid tier: retire the free row silently.
      if (existingActive.tier === "free") {
        await supabase.from("membership_subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
            metadata: { upgraded_to: tier, upgraded_at: new Date().toISOString() },
          })
          .eq("id", existingActive.id);

        await supabase.from("membership_payment_events").insert({
          subscription_id: existingActive.id,
          member_email:    email,
          event_type:      "subscription_upgraded_from_free",
          message:         `Free → ${tier} upgrade initiated.`,
        });
      } else {
        // Paid → different paid tier (or High Ticket amount change). Flag the old
        // row to cancel at period-end so the member isn't double-billed. The
        // new subscription will activate on its own Teya callback.
        await supabase.from("membership_subscriptions")
          .update({ cancel_at_period_end: true })
          .eq("id", existingActive.id);

        await supabase.from("membership_payment_events").insert({
          subscription_id: existingActive.id,
          member_email:    email,
          event_type:      "subscription_tier_change_requested",
          message:         `Tier change requested: ${existingActive.tier} → ${tier}. Old row set to cancel at period end.`,
        });
      }
    }

    // Reuse a prior pending row if it exists, otherwise insert.
    const { data: pending } = await supabase
      .from("membership_subscriptions")
      .select("id")
      .eq("member_email", email)
      .eq("status", "pending_payment")
      .maybeSingle();

    let subscriptionId = pending?.id;
    if (!subscriptionId) {
      const { data: inserted, error: insErr } = await supabase
        .from("membership_subscriptions")
        .insert({
          member_email: email,
          member_name:  fullName,
          user_id:      userId,
          tier,
          price_amount: amount,
          currency:     "ISK",
          interval_unit:"month",
          status:       "pending_payment",
        })
        .select("id")
        .single();
      if (insErr || !inserted) {
        console.error("membership_subscriptions insert failed:", insErr);
        return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
      }
      subscriptionId = inserted.id;
    } else {
      // Update the pending row in case the user switched tiers or High Ticket amount.
      await supabase.from("membership_subscriptions")
        .update({ tier, price_amount: amount, user_id: userId, member_name: fullName })
        .eq("id", subscriptionId);
    }

    const orderId = newOrderId();
    const itemDescription =
      tier === "patron"
        ? `Mama High Ticket — ${amount.toLocaleString("is-IS")} ISK (one-time)`
        : `Mama Tribe — ${amount.toLocaleString("is-IS")} ISK / month`;

    const redirectUrl = buildMembershipCheckoutUrl({
      orderId,
      amount,
      buyerName:  fullName,
      buyerEmail: email,
      language,
      itemDescription,
    });

    // Audit log — checkout created. Useful for debugging abandoned carts.
    await supabase.from("membership_payment_events").insert({
      subscription_id: subscriptionId,
      member_email:    email,
      event_type:      "checkout_created",
      order_id:        orderId,
      amount,
      currency: "ISK",
      raw: { tier, patronAmount: tier === "patron" ? amount : null },
    });

    // Stash the current orderId on the subscription row so the webhook can
    // look it up by orderid even if the ReferenceID field isn't returned.
    await supabase.from("membership_subscriptions")
      .update({ metadata: { last_order_id: orderId, last_order_at: new Date().toISOString() } })
      .eq("id", subscriptionId);

    return NextResponse.json({ url: redirectUrl, orderId, subscriptionId });
  } catch (err) {
    console.error("POST /api/membership/checkout failed:", err);
    return NextResponse.json({ error: err?.message || "Checkout failed." }, { status: 500 });
  }
}
