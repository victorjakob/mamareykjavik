// PATCH /api/private-session/admin/waitlist/[id]
//
// Admin actions:
//   action: "offer"    sets status=offered, generates claim_token, offer_expires_at = +6h
//                      (email sending lives in stage 6 — this just stages the row)
//   action: "remove"   sets status=removed
//   action: "expire"   sets status=expired
//
// The 6h claim window is the spec's value. Once stage 6 wires the email, it
// reads offered_at / offer_expires_at / claim_token from this same row.

import { NextResponse } from "next/server";
import { requireAdminAndSupabase } from "../../_lib/auth";
import { pickString } from "@/app/private-session/_lib/admin-validation";

function makeClaimToken() {
  // 32 hex chars. Cryptographically random where available.
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "") + Math.random().toString(36).slice(2, 6);
  }
  return (
    Math.random().toString(36).slice(2) +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2)
  ).slice(0, 36);
}

export async function PATCH(request, ctx) {
  const gate = await requireAdminAndSupabase();
  if (!gate.ok) return gate.res;
  const { id } = await ctx.params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  switch (body.action) {
    case "offer": {
      // Optionally pin to a specific slot.
      const slotId = pickString(body.slot_id, 60);
      const nowIso = new Date().toISOString();
      const expiresIso = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
      const patch = {
        status: "offered",
        offered_at: nowIso,
        offer_expires_at: expiresIso,
        claim_token: makeClaimToken(),
      };
      if (slotId) patch.slot_id = slotId;

      const { error } = await gate.supabase
        .from("private_session_waitlist")
        .update(patch)
        .eq("id", id);
      if (error) {
        console.error("[admin] offer waitlist failed", error);
        return NextResponse.json({ error: "update_failed" }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }
    case "remove": {
      const { error } = await gate.supabase
        .from("private_session_waitlist")
        .update({ status: "removed" })
        .eq("id", id);
      if (error) {
        console.error("[admin] remove waitlist failed", error);
        return NextResponse.json({ error: "update_failed" }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }
    case "expire": {
      const { error } = await gate.supabase
        .from("private_session_waitlist")
        .update({ status: "expired" })
        .eq("id", id);
      if (error) {
        console.error("[admin] expire waitlist failed", error);
        return NextResponse.json({ error: "update_failed" }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  }
}
