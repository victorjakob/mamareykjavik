// PATCH  /api/admin/tribe-cards/[id]   — edit card (discount, duration, status, notes, etc.)
// DELETE /api/admin/tribe-cards/[id]   — revoke card (soft: status='revoked').
//                                         Pass ?hard=1 to truly delete.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import {
  DURATION_TYPES,
  SOURCES,
  durationToExpiry,
} from "@/lib/tribeCardHelpers";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return { ok: false };
  }
  return { ok: true, session };
}

export async function PATCH(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const supabase = createServerSupabase();

  // Load current row to compute new expiry correctly when duration changes.
  const { data: current, error: loadErr } = await supabase
    .from("tribe_cards")
    .select("*")
    .eq("id", id)
    .single();
  if (loadErr || !current) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const update = {};

  if (body.holder_name !== undefined) {
    const v = String(body.holder_name).trim();
    if (v.length < 2) {
      return NextResponse.json({ error: "Name too short" }, { status: 400 });
    }
    update.holder_name = v;
  }
  if (body.holder_phone !== undefined) {
    update.holder_phone = body.holder_phone?.toString().trim() || null;
  }
  if (body.discount_percent !== undefined) {
    const n = Number(body.discount_percent);
    if (!Number.isFinite(n) || n <= 0 || n > 100) {
      return NextResponse.json({ error: "Discount must be 1–100" }, { status: 400 });
    }
    update.discount_percent = n;
  }
  if (body.duration_type !== undefined) {
    if (!DURATION_TYPES.includes(body.duration_type)) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    }
    update.duration_type = body.duration_type;
    // Recompute expires_at from today — this mirrors "renew for another X".
    update.expires_at = durationToExpiry(body.duration_type);
    update.issued_at = new Date().toISOString();
    if (current.status !== "revoked") update.status = "active";
  }
  if (body.expires_at !== undefined) {
    // Allow admin to set a custom expiry (overrides duration-based one).
    update.expires_at = body.expires_at || null;
  }
  if (body.status !== undefined) {
    if (!["active", "expired", "revoked"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    update.status = body.status;
  }
  if (body.source !== undefined) {
    if (!SOURCES.includes(body.source)) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }
    update.source = body.source;
  }
  if (body.notes !== undefined) {
    update.notes = body.notes?.toString() || null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ card: current });
  }

  const { data: card, error } = await supabase
    .from("tribe_cards")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("admin tribe-card patch error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ card });
}

export async function DELETE(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const hard = searchParams.get("hard") === "1";

  const supabase = createServerSupabase();

  if (hard) {
    const { error } = await supabase.from("tribe_cards").delete().eq("id", id);
    if (error) {
      console.error("admin tribe-card delete error:", error);
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, deleted: "hard" });
  }

  const { error } = await supabase
    .from("tribe_cards")
    .update({ status: "revoked" })
    .eq("id", id);
  if (error) {
    console.error("admin tribe-card revoke error:", error);
    return NextResponse.json({ error: "Failed to revoke" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: "soft" });
}
