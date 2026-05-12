// PATCH/DELETE /api/private-session/admin/offerings/[id]

import { NextResponse } from "next/server";
import { requireAdminAndSupabase } from "../../_lib/auth";
import {
  pickString,
  pickPositiveInt,
  pickBool,
} from "@/app/private-session/_lib/admin-validation";

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
  if ("title" in body) patch.title = pickString(body.title, 200);
  if ("description_md" in body) patch.description_md = pickString(body.description_md, 4000);
  if ("modality" in body) patch.modality = pickString(body.modality, 120);
  if ("duration_minutes" in body) {
    const n = pickPositiveInt(body.duration_minutes, null);
    if (!n) return NextResponse.json({ error: "invalid_duration" }, { status: 400 });
    patch.duration_minutes = n;
  }
  if ("price_isk" in body) patch.price_isk = pickPositiveInt(body.price_isk, 0);
  if ("is_active" in body) {
    const v = pickBool(body.is_active);
    if (v !== null) patch.is_active = v;
  }
  if ("display_order" in body) patch.display_order = pickPositiveInt(body.display_order, 0);

  const { error } = await gate.supabase
    .from("private_session_offerings")
    .update(patch)
    .eq("id", id);
  if (error) {
    console.error("[admin] patch offering failed", error);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request, ctx) {
  const gate = await requireAdminAndSupabase();
  if (!gate.ok) return gate.res;

  const { id } = await ctx.params;

  // If the offering has bookings (any status), refuse hard delete: archive instead.
  // The ON DELETE RESTRICT on private_session_bookings.offering_id would already
  // block this, but archiving is the kinder UX.
  const { data: existing, error: countErr } = await gate.supabase
    .from("private_session_bookings")
    .select("id", { head: false, count: "exact" })
    .eq("offering_id", id);

  if (countErr) {
    console.error("[admin] check offering bookings failed", countErr);
    return NextResponse.json({ error: "check_failed" }, { status: 500 });
  }

  if ((existing?.length || 0) > 0) {
    const { error } = await gate.supabase
      .from("private_session_offerings")
      .update({ is_active: false })
      .eq("id", id);
    if (error) {
      console.error("[admin] archive offering failed", error);
      return NextResponse.json({ error: "archive_failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, archived: true });
  }

  const { error } = await gate.supabase
    .from("private_session_offerings")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("[admin] delete offering failed", error);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, archived: false });
}
