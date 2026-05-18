// PATCH /api/private-session/admin/bookings/[id]
//
// Admin actions:
//   action: "set_location"    body.actual_location → slot
//   action: "mark_completed"
//   action: "mark_no_show"
//   action: "cancel"          body.reason (optional)
//
// Email side-effects are stage 5/6 — this route updates rows only.
// When stage 5 lands, the cron handler can also call a small helper to send
// the location-reveal email after action=set_location.

import { NextResponse } from "next/server";
import { requireAdminAndSupabase } from "../../_lib/auth";
import { pickString } from "@/app/private-session/_lib/admin-validation";

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

  // Fetch the booking + slot so we can apply slot-side updates too.
  const { data: booking, error: getErr } = await gate.supabase
    .from("private_session_bookings")
    .select("id, slot_id, status")
    .eq("id", id)
    .maybeSingle();
  if (getErr || !booking) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  switch (body.action) {
    case "set_location": {
      const location = pickString(body.actual_location, 600);
      if (!location) {
        return NextResponse.json({ error: "location_required" }, { status: 400 });
      }
      const { error } = await gate.supabase
        .from("private_session_slots")
        .update({ actual_location: location })
        .eq("id", booking.slot_id);
      if (error) {
        console.error("[admin] set location failed", error);
        return NextResponse.json({ error: "update_failed" }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }
    case "mark_completed": {
      const { error } = await gate.supabase
        .from("private_session_bookings")
        .update({ status: "completed" })
        .eq("id", id);
      if (error) {
        console.error("[admin] mark_completed failed", error);
        return NextResponse.json({ error: "update_failed" }, { status: 500 });
      }
      // Mirror on the slot.
      await gate.supabase
        .from("private_session_slots")
        .update({ status: "completed" })
        .eq("id", booking.slot_id);
      return NextResponse.json({ ok: true });
    }
    case "mark_no_show": {
      const { error } = await gate.supabase
        .from("private_session_bookings")
        .update({ status: "no_show" })
        .eq("id", id);
      if (error) {
        console.error("[admin] mark_no_show failed", error);
        return NextResponse.json({ error: "update_failed" }, { status: 500 });
      }
      // Slot stays "booked" in history; admin can manually re-open if they want.
      return NextResponse.json({ ok: true });
    }
    case "cancel": {
      const reason = pickString(body.reason, 2000);
      const nowIso = new Date().toISOString();
      const { error } = await gate.supabase
        .from("private_session_bookings")
        .update({
          status: "cancelled",
          cancelled_at: nowIso,
          cancelled_by: "admin",
          cancellation_reason: reason,
        })
        .eq("id", id);
      if (error) {
        console.error("[admin] cancel failed", error);
        return NextResponse.json({ error: "update_failed" }, { status: 500 });
      }
      // Recompute slot status — capacity may be > 1 (e.g. three elders),
      // so we only flip back to 'available' when there's room again.
      const { data: slotRow } = await gate.supabase
        .from("private_session_slots")
        .select("capacity")
        .eq("id", booking.slot_id)
        .maybeSingle();
      const { count: remaining } = await gate.supabase
        .from("private_session_bookings")
        .select("id", { count: "exact", head: true })
        .eq("slot_id", booking.slot_id)
        .neq("status", "cancelled");
      const cap = slotRow?.capacity || 1;
      if ((remaining || 0) < cap) {
        await gate.supabase
          .from("private_session_slots")
          .update({ status: "available" })
          .eq("id", booking.slot_id);
      }
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  }
}
