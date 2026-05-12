// PATCH /api/private-session/admin/slots/[id]
//   Body may include any of: starts_at, ends_at, status, published_area,
//   actual_location, offering_ids (replaces the join rows).
//
// DELETE /api/private-session/admin/slots/[id]
//   Soft-cancel if the slot has a booking (status -> cancelled).
//   Hard delete otherwise.

import { NextResponse } from "next/server";
import { requireAdminAndSupabase } from "../../_lib/auth";
import { pickString } from "@/app/private-session/_lib/admin-validation";

const VALID_STATUSES = new Set(["available", "booked", "cancelled", "completed"]);

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

  const patch = {};
  if ("starts_at" in body) patch.starts_at = pickString(body.starts_at, 40);
  if ("ends_at" in body) patch.ends_at = pickString(body.ends_at, 40);
  if ("status" in body) {
    if (!VALID_STATUSES.has(body.status)) {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }
    patch.status = body.status;
  }
  if ("published_area" in body) patch.published_area = pickString(body.published_area, 200);
  if ("actual_location" in body) patch.actual_location = pickString(body.actual_location, 600);

  if (Object.keys(patch).length > 0) {
    const { error } = await gate.supabase
      .from("private_session_slots")
      .update(patch)
      .eq("id", id);
    if (error) {
      console.error("[admin] patch slot failed", error);
      return NextResponse.json({ error: "update_failed" }, { status: 500 });
    }
  }

  if (Array.isArray(body.offering_ids)) {
    // Replace links wholesale.
    const { error: delErr } = await gate.supabase
      .from("private_session_slot_offerings")
      .delete()
      .eq("slot_id", id);
    if (delErr) {
      console.error("[admin] clear slot offerings failed", delErr);
      return NextResponse.json({ error: "relink_failed" }, { status: 500 });
    }
    const rows = body.offering_ids
      .filter((o) => typeof o === "string")
      .map((offeringId) => ({ slot_id: id, offering_id: offeringId }));
    if (rows.length > 0) {
      const { error: insErr } = await gate.supabase
        .from("private_session_slot_offerings")
        .insert(rows);
      if (insErr) {
        console.error("[admin] insert slot offerings failed", insErr);
        return NextResponse.json({ error: "relink_failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request, ctx) {
  const gate = await requireAdminAndSupabase();
  if (!gate.ok) return gate.res;
  const { id } = await ctx.params;

  // Check for a confirmed/active booking — if there is one, soft-cancel the slot.
  const { data: bookings } = await gate.supabase
    .from("private_session_bookings")
    .select("id, status")
    .eq("slot_id", id);
  const hasActive = (bookings || []).some((b) => b.status !== "cancelled");

  if (hasActive) {
    const { error } = await gate.supabase
      .from("private_session_slots")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) {
      console.error("[admin] soft-cancel slot failed", error);
      return NextResponse.json({ error: "cancel_failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, archived: true });
  }

  const { error } = await gate.supabase
    .from("private_session_slots")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("[admin] delete slot failed", error);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, archived: false });
}
